"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Phone {
  id: string | number;
  brand: string;
  model: string;
  image_url: string | null;
  abdou_score: number | null;
  availability: string | null;
}

interface Stats {
  phonesCount: number;
  imagesCount: number;
  available: number;
  unavailable: number;
  average: string;
}

const quickLinks = [
  { href: "/admin/phones/new", icon: "➕", label: "إضافة هاتف", color: "bg-primary/10 text-primary" },
  { href: "/admin/phones/bulk-import", icon: "📥", label: "رفع جماعي", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { href: "/admin/phones", icon: "📱", label: "إدارة الهواتف", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { href: "/admin/images", icon: "🖼️", label: "مكتبة الصور", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { href: "/admin/settings", icon: "⚙️", label: "إعدادات الموقع", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
];

const LATEST_PHONES_LIMIT = 5;
const IMAGE_LIST_LIMIT = 1000;
const PLACEHOLDER_IMAGE = "/placeholder.png" as const;

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    phonesCount: 0,
    imagesCount: 0,
    available: 0,
    unavailable: 0,
    average: "0",
  });
  const [latestPhones, setLatestPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadStats();
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function loadStats() {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      const [
        { count: phonesCount, error: phonesErr },
        { data: images, error: imagesErr },
        { count: availableCount, error: availErr },
        { data: scores, error: scoresErr },
        { data: latest, error: latestErr },
      ] = await Promise.all([
        supabase.from("phones").select("*", { count: "exact", head: true }),
        supabase.storage.from("phone-images").list("", { limit: IMAGE_LIST_LIMIT }),
        supabase
          .from("phones")
          .select("*", { count: "exact", head: true })
          .eq("availability", "Available"),
        supabase.from("phones").select("abdou_score"),
        supabase
          .from("phones")
          .select("id, brand, model, image_url, abdou_score, availability")
          .order("id", { ascending: false })
          .limit(LATEST_PHONES_LIMIT),
      ]);

      const firstError = phonesErr || imagesErr || availErr || scoresErr || latestErr;
      if (firstError) throw firstError;

      const averageScore =
        scores && scores.length
          ? (
              scores.reduce((sum, p) => sum + (p.abdou_score || 0), 0) /
              scores.length
            ).toFixed(1)
          : "0";

      const total = phonesCount || 0;
      const available = availableCount || 0;
      const unavailable = Math.max(total - available, 0);

      if (currentRequest !== requestId.current || !isMounted.current) return;

      setStats({
        phonesCount: total,
        imagesCount: images?.length || 0,
        available,
        unavailable,
        average: averageScore,
      });

      setLatestPhones(latest || []);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      if (currentRequest === requestId.current && isMounted.current) {
        setError("حدث خطأ أثناء تحميل البيانات. حاول تحديث الصفحة.");
      }
    } finally {
      if (currentRequest === requestId.current && isMounted.current) {
        setLoading(false);
      }
    }
  }

  const statCards = [
    { icon: "📱", label: "إجمالي الهواتف", value: stats.phonesCount, color: "bg-primary/10 text-primary" },
    { icon: "🖼️", label: "الصور", value: stats.imagesCount, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { icon: "✅", label: "المتوفر", value: stats.available, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { icon: "⛔", label: "غير المتوفر", value: stats.unavailable, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
    { icon: "⭐", label: "متوسط ABDOU GSM", value: stats.average, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { icon: "💠", label: "حالة النظام", value: "Online", isText: true, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-muted-foreground">نظرة عامة على متجرك</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          {loading ? "جارِ التحديث..." : "🔄 تحديث"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" aria-live="polite">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <span className={`grid size-10 place-items-center rounded-xl text-lg ${card.color}`}>
              {card.icon}
            </span>
            <p className="mt-3 text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className={`mt-1 font-display font-bold tabular-nums text-foreground ${card.isText ? "text-xl" : "text-2xl"}`}>
              {loading ? "…" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevation-md"
          >
            <span className={`grid size-10 place-items-center rounded-xl text-lg ${link.color}`}>
              {link.icon}
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">{link.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <h2 className="font-display text-base font-semibold text-foreground">آخر الهواتف المضافة</h2>
          <Link href="/admin/phones" className="text-sm font-medium text-primary">
            عرض الكل
          </Link>
        </div>

        <div className="divide-y divide-border/60">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">جارِ التحميل...</p>
          ) : latestPhones.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">لا توجد هواتف مضافة بعد.</p>
          ) : (
            latestPhones.map((phone) => (
              <div key={phone.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {/* Kept as a native <img>, not next/image: this relies on
                      an imperative `onError` handler that mutates
                      `e.currentTarget.src` directly to fall back to a
                      placeholder. next/image manages `src` itself, so
                      reassigning the DOM node's src out from under it here
                      would fight the component instead of degrading
                      gracefully. */}
                  <img
                    src={phone.image_url || PLACEHOLDER_IMAGE}
                    alt={`${phone.brand} ${phone.model}`}
                    className="h-12 w-12 rounded-xl bg-secondary/40 object-cover"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== window.location.origin + PLACEHOLDER_IMAGE) {
                        img.src = PLACEHOLDER_IMAGE;
                      }
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {phone.brand} {phone.model}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ⭐ {phone.abdou_score ?? "—"} · {phone.availability ?? "غير محدد"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}