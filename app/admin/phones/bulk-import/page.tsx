"use client";

import { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { toLatinDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORIES, FALLBACK_PHONES } from "@/lib/data";

/**
 * Bulk phone import — the batch alternative to the one-at-a-time form at
 * /admin/phones/new. An admin fills a spreadsheet (Excel or CSV) offline —
 * researching specs from GSMArena, pricing from the local market — then
 * uploads it here for validation, duplicate detection, and a single
 * batched insert. Images are entirely out of scope for this flow —
 * intentionally not even an optional column — since they're always added
 * manually afterward per-phone at /admin/phones/[id] (which already has
 * the full image library + upload UI). An existing phone match (by
 * brand+model) is always treated as a duplicate and skipped; this
 * importer does not update existing rows.
 */

// Column headers exactly as they appear in the downloadable template —
// row parsing below looks these up by name (not position), so a
// reordered or partially-filled sheet still works.
const COLUMNS = {
  brand: "الماركة",
  model: "الموديل",
  category: "الفئة",
  priceNew: "السعر الجديد",
  priceUsed: "السعر المستعمل",
  description: "الوصف",
  topFeature: "الميزة الأبرز",
  processor: "المعالج",
  ram: "الرام (GB)",
  storage: "التخزين (GB)",
  screenSize: "حجم الشاشة",
  displayTech: "تقنية الشاشة",
  batteryCapacity: "البطارية (mAh)",
  chargingSpeed: "سرعة الشحن",
  mainCamera: "الكاميرا الرئيسية",
  os: "نظام التشغيل",
  releaseDate: "سنة الإصدار",
  availability: "التوفر",
  has5g: "يدعم 5G",
  scorePerformance: "تقييم الأداء",
  scoreCamera: "تقييم الكاميرا",
  scoreDisplay: "تقييم الشاشة",
  scoreBattery: "تقييم البطارية",
  scoreValue: "تقييم القيمة",
  scoreSoftware: "تقييم البرمجيات",
  scoreFeatures: "تقييم المزايا",
  scoreGaming: "تقييم الألعاب",
  abdouScore: "تقييم ABDOU GSM",
  strengths: "نقاط القوة",
  weaknesses: "نقاط الضعف",
} as const;

// Fix #1: category is NOT NULL in the DB — required, same tier as
// brand/model/price_new, not an optional free-text field.
const REQUIRED_COLUMNS = [COLUMNS.brand, COLUMNS.model, COLUMNS.category, COLUMNS.priceNew] as const;

// One example row so a first-time user sees the expected shape and units
// immediately, without needing separate instructions.
const EXAMPLE_ROW: Record<string, string> = {
  [COLUMNS.brand]: "Samsung",
  [COLUMNS.model]: "Galaxy A55",
  [COLUMNS.category]: "Mid-Range",
  [COLUMNS.priceNew]: "62000",
  [COLUMNS.priceUsed]: "48000",
  [COLUMNS.description]: "هاتف متوسط المدى بأداء قوي وشاشة AMOLED",
  [COLUMNS.topFeature]: "شاشة 120Hz",
  [COLUMNS.processor]: "Exynos 1480",
  [COLUMNS.ram]: "8",
  [COLUMNS.storage]: "256",
  [COLUMNS.screenSize]: "6.6 inch",
  [COLUMNS.displayTech]: "Super AMOLED",
  [COLUMNS.batteryCapacity]: "5000",
  [COLUMNS.chargingSpeed]: "25W",
  [COLUMNS.mainCamera]: "50MP",
  [COLUMNS.os]: "Android 14",
  [COLUMNS.releaseDate]: "2024",
  [COLUMNS.availability]: "Available",
  [COLUMNS.has5g]: "نعم",
  [COLUMNS.scorePerformance]: "7.5",
  [COLUMNS.scoreCamera]: "7",
  [COLUMNS.scoreDisplay]: "8",
  [COLUMNS.scoreBattery]: "8",
  [COLUMNS.scoreValue]: "8.5",
  [COLUMNS.scoreSoftware]: "7",
  [COLUMNS.scoreFeatures]: "7",
  [COLUMNS.scoreGaming]: "6.5",
  [COLUMNS.abdouScore]: "7.5",
  [COLUMNS.strengths]: "بطارية تدوم طويلاً; شاشة ممتازة",
  [COLUMNS.weaknesses]: "شحن بطيء نسبياً",
};

type RowStatus = "valid" | "duplicate" | "error";

interface ParsedRow {
  rowNumber: number; // 1-based, matches the spreadsheet row for easy lookup
  status: RowStatus;
  errors: string[];
  brand: string;
  model: string;
  insertPayload: Record<string, unknown> | null;
}

// Fields that must parse as a plain number (after Arabic/Persian digit
// normalization). `range` enforces the same 0–10 the single-phone form's
// score sliders enforce, so a bulk import can't silently write a score of
// 99 that the rest of the UI never expects. `integer: true` additionally
// rejects fractional values — price_new/price_used/battery_capacity are
// all INTEGER columns in the DB, so "62000.5" must be a validation error,
// not silently truncated or sent as a float the column would reject.
// `unit`/`thousands` opt specific fields into the lenient parsing in
// parseNumberCell below — scores and everything else stay strict.
const NUMERIC_FIELDS: {
  key: keyof typeof COLUMNS
  required: boolean
  range?: [number, number]
  integer?: boolean
  unit?: string
  thousands?: boolean
}[] = [
  { key: "priceNew", required: true, range: [0, Infinity], integer: true, thousands: true },
  { key: "priceUsed", required: false, range: [0, Infinity], integer: true, thousands: true },
  { key: "batteryCapacity", required: false, range: [0, 99999], integer: true, unit: "mAh" },
  { key: "scorePerformance", required: false, range: [0, 10] },
  { key: "scoreCamera", required: false, range: [0, 10] },
  { key: "scoreDisplay", required: false, range: [0, 10] },
  { key: "scoreBattery", required: false, range: [0, 10] },
  { key: "scoreValue", required: false, range: [0, 10] },
  { key: "scoreSoftware", required: false, range: [0, 10] },
  { key: "scoreFeatures", required: false, range: [0, 10] },
  { key: "scoreGaming", required: false, range: [0, 10] },
  { key: "abdouScore", required: false, range: [0, 10] },
];

// release_date is a TEXT column in the DB (not INTEGER) — it must be
// preserved as text on the way in, not coerced to a JS number. Still
// validated as a plausible 4-digit year so a typo like "20204" is caught
// at preview time instead of being written as garbage text.
function validateReleaseDate(raw: unknown): { value: string | null; error: string | null } {
  const text = toLatinDigits(cellText(raw));
  if (text === "") return { value: null, error: null };
  if (!/^\d{4}$/.test(text)) {
    return { value: null, error: `${COLUMNS.releaseDate} يجب أن يكون سنة من 4 أرقام` };
  }
  const year = Number(text);
  if (year < 2000 || year > 2100) {
    return { value: null, error: `${COLUMNS.releaseDate} يجب أن يكون بين 2000 و2100` };
  }
  return { value: text, error: null };
}

// has_5g must be an explicit yes/no — an unrecognized value (a typo, a
// stray note, anything that isn't clearly true or false) is a validation
// error now, not a silent "false" that quietly writes a wrong spec.
const TRUE_VALUES = new Set(["نعم", "true", "1", "yes", "y"]);
const FALSE_VALUES = new Set(["لا", "false", "0", "no", "n"]);

function validateHas5g(raw: unknown): { value: boolean; error: string | null } {
  const text = cellText(raw).toLowerCase();
  if (text === "") return { value: false, error: null }; // blank = intentional default, not "unknown"
  if (TRUE_VALUES.has(text)) return { value: true, error: null };
  if (FALSE_VALUES.has(text)) return { value: false, error: null };
  return { value: false, error: `${COLUMNS.has5g} قيمة غير معروفة: "${cellText(raw)}" (استخدم نعم/لا)` };
}

function parseNumberCell(raw: unknown, opts?: { unit?: string; thousands?: boolean }): number | null {
  if (raw == null || raw === "") return null;
  let normalized = toLatinDigits(String(raw)).trim();
  if (normalized === "") return null;

  // Strip a trailing unit ONLY if it exactly matches the expected one
  // (case-insensitive) — "5000 mAh" -> "5000", but "5000 abc" is left
  // untouched and correctly fails to parse below. This never accepts an
  // arbitrary suffix as "probably a unit."
  if (opts?.unit) {
    const unitPattern = new RegExp(`\\s*${opts.unit}\\s*$`, "i");
    if (unitPattern.test(normalized)) {
      normalized = normalized.replace(unitPattern, "").trim();
    }
  }

  // Accept space- or comma-grouped thousands ("62 000", "62,000",
  // "1,234,567") — but only the exact grouped-integer shape: every group
  // after the first must be exactly 3 digits, and the separator must be
  // consistent. That's the only case that's genuinely unambiguous;
  // anything else ("62,5", "62 5") is left as-is and correctly fails to
  // parse, since a 1–2 digit trailing group could just as easily be a
  // decimal in some locale, not a thousands group.
  if (opts?.thousands && /^\d{1,3}(?:[ ,]\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/[ ,]/g, "");
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN; // NaN signals "present but invalid"
}

function cellText(raw: unknown): string {
  return raw == null ? "" : String(raw).trim();
}

// Collapses internal runs of whitespace ("Samsung   Galaxy" -> "Samsung
// Galaxy") on top of cellText's outer trim — applied to brand/model/
// category before either duplicate-detection or insert, so both use the
// exact same normalized value rather than two slightly different ones.
function collapseWhitespace(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

// Known brands/categories come straight from the site's own fallback
// catalog and category list (lib/data.ts) — one source of truth, not a
// second hardcoded list that can drift out of sync with it.
const KNOWN_BRANDS = Array.from(new Set(FALLBACK_PHONES.map((p) => p.brand)));
const KNOWN_CATEGORIES = CATEGORIES.map((c) => c.key);

// Brand casing is canonicalized on a best-effort basis: a case-insensitive
// match against a brand the site already knows about ("samsung" ->
// "Samsung", "ONEPLUS" -> "OnePlus") is corrected to the exact casing the
// rest of the site uses, so the same brand doesn't fragment into multiple
// differently-cased entries across imports. An unrecognized brand is NOT
// an error — new brands are legitimate — it's just Title-Cased as a
// reasonable default rather than left however it was typed.
function canonicalizeBrand(raw: string): string {
  const trimmed = collapseWhitespace(raw);
  if (!trimmed) return trimmed;
  const known = KNOWN_BRANDS.find((b) => b.toLowerCase() === trimmed.toLowerCase());
  if (known) return known;
  return trimmed.replace(/\p{L}[\p{L}\d]*/gu, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

// Category, unlike brand, drives the site's category filter tabs
// (lib/data.ts CATEGORIES) — an unrecognized value wouldn't just look
// slightly off, it would silently never appear under any filter. So a
// category that doesn't case-insensitively match one of the 4 known keys
// is a validation error (with the valid options listed), not a soft
// best-effort correction like brand.
function canonicalizeCategory(raw: string): { value: string; error: string | null } {
  const trimmed = collapseWhitespace(raw);
  if (!trimmed) return { value: "", error: null }; // required-check happens separately
  const known = KNOWN_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (known) return { value: known, error: null };
  return {
    value: trimmed,
    error: `${COLUMNS.category} غير معروفة: "${trimmed}" — استخدم إحدى: ${KNOWN_CATEGORIES.join("، ")}`,
  };
}

function downloadTemplate() {
  const headers = Object.values(COLUMNS);
  const sheet = XLSX.utils.json_to_sheet([EXAMPLE_ROW], { header: headers });
  // Give required columns a visibly wider column so they aren't skipped —
  // there's no reliable cross-viewer way to bold just the header cell
  // text via SheetJS without a full styling build, so width is the signal.
  sheet["!cols"] = headers.map((h) => ({ wch: REQUIRED_COLUMNS.includes(h as any) ? 22 : 16 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "الهواتف");
  XLSX.writeFile(workbook, "قالب-رفع-الهواتف-ABDOU-GSM.xlsx");
}

export default function BulkImportPage() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [uploadResult, setUploadResult] = useState<{
    imported: number;
    failed: number;
    failedRows: { rowNumber: number; brand: string; model: string; reason: string }[];
  } | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setParsing(true);
    setParseError(null);
    setUploadResult(null);
    setRows([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (raw.length === 0) {
        setParseError("الملف فارغ — لا توجد صفوف بيانات لقراءتها.");
        setParsing(false);
        return;
      }

      const missingRequired = REQUIRED_COLUMNS.filter((col) => !(col in raw[0]));
      if (missingRequired.length > 0) {
        setParseError(
          `الأعمدة التالية مفقودة من الملف: ${missingRequired.join("، ")}. تأكد من استخدام القالب دون تعديل أسماء الأعمدة.`,
        );
        setParsing(false);
        return;
      }

      // Existing brand+model pairs, fetched once, for duplicate detection.
      // Comparison is case/whitespace-insensitive since "iPhone 15" and
      // "iphone 15 " are the same phone to a human filling a spreadsheet.
      const { data: existing, error: existingError } = await supabase.from("phones").select("brand, model");
      if (existingError) {
        setParseError(`تعذر التحقق من الهواتف الموجودة مسبقاً: ${existingError.message}`);
        setParsing(false);
        return;
      }
      const existingKeys = new Set(
        (existing ?? []).map(
          (p) => `${collapseWhitespace(cellText(p.brand)).toLowerCase()}::${collapseWhitespace(cellText(p.model)).toLowerCase()}`,
        ),
      );
      const seenInFile = new Set<string>();

      const parsed: ParsedRow[] = raw.map((cells, i) => {
        const rowNumber = i + 2; // +1 for 1-based, +1 for the header row
        const errors: string[] = [];

        const brand = canonicalizeBrand(cellText(cells[COLUMNS.brand]));
        // Model is intentionally NOT casing-canonicalized — it's the
        // user's meaningful, specific product name ("iPhone 15 Pro Max",
        // "Galaxy A55 5G"), and guessing a "corrected" casing for it risks
        // actively breaking a name that was typed correctly on purpose.
        // Only whitespace is normalized, same as everything else.
        const model = collapseWhitespace(cellText(cells[COLUMNS.model]));
        const categoryResult = canonicalizeCategory(cellText(cells[COLUMNS.category]));
        const category = categoryResult.value;
        if (!brand) errors.push("الماركة مفقودة");
        if (!model) errors.push("الموديل مفقود");
        if (!category) errors.push(`${COLUMNS.category} مطلوب`);
        else if (categoryResult.error) errors.push(categoryResult.error);

        const numbers: Record<string, number | null> = {};
        for (const field of NUMERIC_FIELDS) {
          const value = parseNumberCell(cells[COLUMNS[field.key]], { unit: field.unit, thousands: field.thousands });
          if (value !== null && Number.isNaN(value)) {
            errors.push(`${COLUMNS[field.key]} يجب أن يكون رقماً`);
          } else if (field.required && value === null) {
            errors.push(`${COLUMNS[field.key]} مطلوب`);
          } else if (value !== null && field.range) {
            const [min, max] = field.range;
            if (value < min || value > max) {
              errors.push(`${COLUMNS[field.key]} يجب أن يكون بين ${min} و${max === Infinity ? "∞" : max}`);
            }
          }
          if (value !== null && !Number.isNaN(value) && field.integer && !Number.isInteger(value)) {
            errors.push(`${COLUMNS[field.key]} يجب أن يكون عدداً صحيحاً (بدون فواصل عشرية)`);
          }
          numbers[field.key] = Number.isNaN(value) ? null : value;
        }

        const releaseDateResult = validateReleaseDate(cells[COLUMNS.releaseDate]);
        if (releaseDateResult.error) errors.push(releaseDateResult.error);

        const has5gResult = validateHas5g(cells[COLUMNS.has5g]);
        if (has5gResult.error) errors.push(has5gResult.error);

        const key = `${brand.toLowerCase()}::${model.toLowerCase()}`;
        let status: RowStatus = errors.length > 0 ? "error" : "valid";
        // Existing-phone match is always DUPLICATE → SKIP for now; this
        // importer intentionally does not update existing rows.
        if (status === "valid" && (existingKeys.has(key) || seenInFile.has(key))) {
          status = "duplicate";
        }
        if (brand && model) seenInFile.add(key);

        const insertPayload =
          status === "valid"
            ? {
                brand,
                model,
                category,
                description: cellText(cells[COLUMNS.description]) || null,
                top_feature: cellText(cells[COLUMNS.topFeature]) || null,
                processor: cellText(cells[COLUMNS.processor]) || null,
                ram: cellText(cells[COLUMNS.ram]) || null,
                storage: cellText(cells[COLUMNS.storage]) || null,
                screen_size: cellText(cells[COLUMNS.screenSize]) || null,
                display_tech: cellText(cells[COLUMNS.displayTech]) || null,
                battery_capacity: numbers.batteryCapacity, // INTEGER column — number | null, never a string
                charging_speed: cellText(cells[COLUMNS.chargingSpeed]) || null,
                main_camera: cellText(cells[COLUMNS.mainCamera]) || null,
                os: cellText(cells[COLUMNS.os]) || null,
                release_date: releaseDateResult.value, // TEXT column — preserved as text, never coerced to a number
                availability: cellText(cells[COLUMNS.availability]) || null,
                has_5g: has5gResult.value,
                score_performance: numbers.scorePerformance ?? 0,
                score_camera: numbers.scoreCamera ?? 0,
                score_display: numbers.scoreDisplay ?? 0,
                score_battery: numbers.scoreBattery ?? 0,
                score_value: numbers.scoreValue ?? 0,
                score_software: numbers.scoreSoftware ?? 0,
                score_features: numbers.scoreFeatures ?? 0,
                score_gaming: numbers.scoreGaming ?? 0,
                abdou_score: numbers.abdouScore ?? 0,
                strengths: cellText(cells[COLUMNS.strengths]) || null,
                weaknesses: cellText(cells[COLUMNS.weaknesses]) || null,
                price_new: numbers.priceNew,
                price_used: numbers.priceUsed,
              }
            : null;

        return { rowNumber, status, errors, brand, model, insertPayload };
      });

      setRows(parsed);
    } catch (err) {
      setParseError(
        `تعذرت قراءة الملف. تأكد أنه بصيغة Excel (.xlsx) أو CSV صحيحة. (${err instanceof Error ? err.message : String(err)})`,
      );
    } finally {
      setParsing(false);
    }
  }

  const validRows = rows.filter((r) => r.status === "valid");
  const duplicateCount = rows.filter((r) => r.status === "duplicate").length;
  const errorCount = rows.filter((r) => r.status === "error").length;

  async function handleUpload() {
    if (validRows.length === 0) return;
    setUploading(true);
    setUploadResult(null);
    setUploadProgress({ done: 0, total: validRows.length });

    const CHUNK_SIZE = 50; // stay well under any request-size limit
    let imported = 0;
    const failedRows: { rowNumber: number; brand: string; model: string; reason: string }[] = [];

    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      const chunk = validRows.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase.from("phones").insert(chunk.map((r) => r.insertPayload!));

      if (!error) {
        // Whole chunk succeeded — the common case.
        imported += chunk.length;
        setUploadProgress((p) => ({ ...p, done: p.done + chunk.length }));
        continue;
      }

      // Fix #8: the chunk failed as a group, but that doesn't mean every
      // row in it was bad — a single invalid row (e.g. a constraint
      // violation Postgres only catches at insert time) can fail an
      // otherwise-valid batch. Retry this chunk one row at a time so
      // valid rows still get imported and only the genuinely bad ones are
      // reported as failed, instead of losing the whole chunk.
      for (const row of chunk) {
        const { error: rowError } = await supabase.from("phones").insert([row.insertPayload!]);
        if (rowError) {
          failedRows.push({ rowNumber: row.rowNumber, brand: row.brand, model: row.model, reason: rowError.message });
        } else {
          imported += 1;
        }
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }

    setUploadResult({
      imported,
      failed: failedRows.length,
      failedRows,
    });
    setUploading(false);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">رفع جماعي للهواتف</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أضف عشرات الهواتف دفعة واحدة عبر ملف Excel بدل تعبئة نموذج لكل هاتف.
          </p>
        </div>
        <Link href="/admin/phones" className="text-sm font-medium text-primary hover:underline">
          ← رجوع لقائمة الهواتف
        </Link>
      </div>

      {/* Step 1 — template */}
      <section className="mb-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-foreground">1. حمّل القالب</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          يحتوي القالب على كل الأعمدة المطلوبة وصف مثال جاهز. الأعمدة{" "}
          <span className="font-medium text-foreground">الماركة، الموديل، الفئة، السعر الجديد</span> إلزامية — الباقي
          اختياري. الفئة يجب أن تكون واحدة من:{" "}
          <span className="font-medium text-foreground">{KNOWN_CATEGORIES.join("، ")}</span>.
        </p>
        <button
          onClick={downloadTemplate}
          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          تحميل القالب (Excel)
        </button>
      </section>

      {/* Step 2 — upload */}
      <section className="mb-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-foreground">2. ارفع الملف المعبّأ</h2>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-10 text-center transition-colors hover:border-primary hover:bg-secondary/30">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = ""; // allow re-selecting the same file after fixing it
            }}
          />
          <span className="text-sm font-medium text-foreground">
            {fileName ? `الملف المحدد: ${fileName}` : "اضغط لاختيار ملف Excel أو CSV"}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">.xlsx أو .xls أو .csv</span>
        </label>
        {parsing && <p className="mt-3 text-sm text-muted-foreground">جارٍ قراءة الملف والتحقق من الهواتف...</p>}
        {parseError && (
          <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{parseError}</div>
        )}
      </section>

      {/* Step 3 — preview */}
      {rows.length > 0 && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold text-foreground">3. راجع النتائج</h2>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-success/10 px-3 py-1 font-medium text-success">
              {validRows.length} صالح للإضافة
            </span>
            {duplicateCount > 0 && (
              <span className="rounded-full bg-warning/10 px-3 py-1 font-medium text-warning">
                {duplicateCount} مكرر (سيُتجاوز تلقائياً)
              </span>
            )}
            {errorCount > 0 && (
              <span className="rounded-full bg-destructive/10 px-3 py-1 font-medium text-destructive">
                {errorCount} به خطأ (سيُتجاوز)
              </span>
            )}
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-border">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead className="sticky top-0 bg-secondary/60 backdrop-blur">
                <tr className="text-start text-xs font-medium text-muted-foreground">
                  <th className="px-3 py-2 text-start font-medium">الصف</th>
                  <th className="px-3 py-2 text-start font-medium">الهاتف</th>
                  <th className="px-3 py-2 text-start font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.rowNumber}>
                    <td className="px-3 py-2 text-muted-foreground">{r.rowNumber}</td>
                    <td className="px-3 py-2 text-foreground">
                      {r.brand || "—"} {r.model || ""}
                    </td>
                    <td className="px-3 py-2">
                      {r.status === "valid" && <span className="text-success">✓ صالح</span>}
                      {r.status === "duplicate" && <span className="text-warning">⚠ مكرر — موجود مسبقاً</span>}
                      {r.status === "error" && (
                        <span className="text-destructive">✗ {r.errors.join("، ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={validRows.length === 0 || uploading}
            className={cn(
              "mt-5 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform",
              validRows.length === 0 || uploading
                ? "cursor-not-allowed bg-secondary text-muted-foreground"
                : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            {uploading
              ? `جارٍ الرفع... (${uploadProgress.done}/${uploadProgress.total})`
              : `رفع ${validRows.length} هاتف`}
          </button>

          {uploadResult && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-sm sm:grid-cols-6">
                <div className="rounded-lg bg-secondary/40 p-2">
                  <div className="font-display text-lg font-bold text-foreground">{rows.length}</div>
                  <div className="text-xs text-muted-foreground">الإجمالي</div>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2">
                  <div className="font-display text-lg font-bold text-foreground">{validRows.length}</div>
                  <div className="text-xs text-muted-foreground">صالح</div>
                </div>
                <div className="rounded-lg bg-warning/10 p-2">
                  <div className="font-display text-lg font-bold text-warning">{duplicateCount}</div>
                  <div className="text-xs text-muted-foreground">مكرر</div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2">
                  <div className="font-display text-lg font-bold text-destructive">{errorCount}</div>
                  <div className="text-xs text-muted-foreground">به خطأ</div>
                </div>
                <div className="rounded-lg bg-success/10 p-2">
                  <div className="font-display text-lg font-bold text-success">{uploadResult.imported}</div>
                  <div className="text-xs text-muted-foreground">تمت الإضافة</div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2">
                  <div className="font-display text-lg font-bold text-destructive">{uploadResult.failed}</div>
                  <div className="text-xs text-muted-foreground">فشل الرفع</div>
                </div>
              </div>

              {uploadResult.failedRows.length > 0 && (
                <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  <p className="font-medium">صفوف فشل رفعها رغم صلاحيتها (مشكلة في قاعدة البيانات وليس في البيانات):</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {uploadResult.failedRows.map((f) => (
                      <li key={f.rowNumber}>
                        الصف {f.rowNumber} ({f.brand} {f.model}): {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {uploadResult.imported > 0 && (
                <Link href="/admin/phones" className="inline-block text-sm font-medium text-primary underline">
                  عرض قائمة الهواتف
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        ملاحظة: هذه الأداة لا ترفع الصور. أضف صورة كل هاتف لاحقاً من صفحة تعديله بعد الرفع.
      </p>
    </div>
  );
}