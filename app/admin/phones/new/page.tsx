"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { FileObject } from "@supabase/storage-js";

const MAX_FILE_SIZE_MB = 5;

const inputClass =
  "w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";
const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

export default function NewPhonePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");

  const [priceNew, setPriceNew] = useState("");
  const [priceUsed, setPriceUsed] = useState("");

  const [description, setDescription] = useState("");
  const [topFeature, setTopFeature] = useState("");

  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");

  const [screenSize, setScreenSize] = useState("");
  const [displayTech, setDisplayTech] = useState("");

  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [chargingSpeed, setChargingSpeed] = useState("");

  const [mainCamera, setMainCamera] = useState("");
  const [os, setOs] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [availability, setAvailability] = useState("");
  const [has5g, setHas5g] = useState(true);

  const [scorePerformance, setScorePerformance] = useState("");
  const [scoreCamera, setScoreCamera] = useState("");
  const [scoreDisplay, setScoreDisplay] = useState("");
  const [scoreBattery, setScoreBattery] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [scoreSoftware, setScoreSoftware] = useState("");
  const [scoreFeatures, setScoreFeatures] = useState("");
  const [scoreGaming, setScoreGaming] = useState("");

  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [abdouScore, setAbdouScore] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryImages, setLibraryImages] = useState<FileObject[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`حجم الصورة يجب أن يكون أقل من ${MAX_FILE_SIZE_MB} ميجابايت.`);
      e.target.value = "";
      return;
    }

    setImage(file);
    setImageUrl("");
  }

  function validate(): string | null {
    if (!brand.trim()) return "الرجاء إدخال اسم الشركة.";
    if (!model.trim()) return "الرجاء إدخال الموديل.";
    if (!priceNew.trim() || Number(priceNew) <= 0) return "الرجاء إدخال سعر صالح للهاتف الجديد.";
    return null;
  }

  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setLoading(true);

    try {
      let uploadedImage = "";

      if (image) {
        const extension = image.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("phone-images")
          .upload(fileName, image);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data } = supabase.storage.from("phone-images").getPublicUrl(fileName);
        uploadedImage = data.publicUrl;
      }

      const { error } = await supabase.from("phones").insert({
        brand,
        model,
        category,
        description,
        top_feature: topFeature,
        processor,
        ram,
        storage,
        screen_size: screenSize,
        display_tech: displayTech,
        battery_capacity: batteryCapacity,
        charging_speed: chargingSpeed,
        main_camera: mainCamera,
        os,
        release_date: releaseDate ? Number(releaseDate) : null,
        availability,
        has_5g: has5g,
        score_performance: Number(scorePerformance) || 0,
        score_camera: Number(scoreCamera) || 0,
        score_display: Number(scoreDisplay) || 0,
        score_battery: Number(scoreBattery) || 0,
        score_value: Number(scoreValue) || 0,
        score_software: Number(scoreSoftware) || 0,
        score_features: Number(scoreFeatures) || 0,
        score_gaming: Number(scoreGaming) || 0,
        strengths,
        weaknesses,
        abdou_score: Number(abdouScore) || 0,
        price_new: Number(priceNew),
        price_used: priceUsed.trim() ? Number(priceUsed) : null,
        image_url: uploadedImage || imageUrl || null,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("تمت إضافة الهاتف بنجاح");
      router.push("/admin/phones");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function loadLibrary() {
    setLibraryLoading(true);
    const { data, error } = await supabase.storage.from("phone-images").list("", { limit: 500 });
    setLibraryLoading(false);

    if (error) {
      alert("تعذر تحميل مكتبة الصور.");
      return;
    }

    setLibraryImages(data || []);
    setShowLibrary(true);
  }

  function imageUrlFromStorage(name: string) {
    return supabase.storage.from("phone-images").getPublicUrl(name).data.publicUrl;
  }

  function pickFromLibrary(name: string) {
    setImageUrl(imageUrlFromStorage(name));
    setImage(null);
    setShowLibrary(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-10 font-display text-2xl font-bold text-foreground">إضافة هاتف جديد</h1>

      <form onSubmit={savePhone} className="space-y-14">
        {formError && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
        )}

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">معلومات أساسية</h2>
          <div><label className={labelClass}>الشركة</label><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Samsung" className={inputClass} /></div>
          <div><label className={labelClass}>الموديل</label><input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Galaxy S25 Ultra" className={inputClass} /></div>
          <div><label className={labelClass}>الفئة</label><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Flagship" className={inputClass} /></div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">السعر</h2>
          <div className="grid grid-cols-2 gap-6">
            <div><label className={labelClass}>السعر الجديد</label><input type="number" lang="en" autoComplete="off" min="0" value={priceNew} onChange={(e) => setPriceNew(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>سعر المستعمل</label><input type="number" lang="en" autoComplete="off" min="0" value={priceUsed} onChange={(e) => setPriceUsed(e.target.value)} className={inputClass} /></div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">الوصف</h2>
          <div><label className={labelClass}>الوصف</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
          <div><label className={labelClass}>أهم ميزة</label><input value={topFeature} onChange={(e) => setTopFeature(e.target.value)} className={inputClass} /></div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">المواصفات</h2>
          <div className="grid grid-cols-2 gap-6">
            <div><label className={labelClass}>المعالج</label><input value={processor} onChange={(e) => setProcessor(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>الرام</label><input value={ram} onChange={(e) => setRam(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>التخزين</label><input value={storage} onChange={(e) => setStorage(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>حجم الشاشة</label><input value={screenSize} onChange={(e) => setScreenSize(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>نوع الشاشة</label><input value={displayTech} onChange={(e) => setDisplayTech(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>البطارية</label><input value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>سرعة الشحن</label><input value={chargingSpeed} onChange={(e) => setChargingSpeed(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>الكاميرا الرئيسية</label><input value={mainCamera} onChange={(e) => setMainCamera(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>نظام التشغيل</label><input value={os} onChange={(e) => setOs(e.target.value)} className={inputClass} /></div>
            <div>
              <label className={labelClass}>سنة الإصدار</label>
              <input type="number" lang="en" autoComplete="off" min="2000" max="2100" placeholder="2026" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">صورة الهاتف</h2>
          <div className="flex flex-wrap items-center gap-4">
            <label className="cursor-pointer rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-foreground">
              اختر صورة
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button type="button" onClick={loadLibrary} disabled={libraryLoading} className="text-sm font-medium text-primary hover:underline disabled:opacity-50">
              {libraryLoading ? "..." : "اختر من المكتبة"}
            </button>
          </div>
          {image && <p className="text-sm text-muted-foreground">{image.name}</p>}
          {imageUrl && <img src={imageUrl} alt="الصورة المختارة" className="h-32 rounded-xl bg-secondary/40 object-contain p-2" />}
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">التقييمات (من 0 إلى 10)</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {[
              ["Performance", scorePerformance, setScorePerformance],
              ["Camera", scoreCamera, setScoreCamera],
              ["Display", scoreDisplay, setScoreDisplay],
              ["Battery", scoreBattery, setScoreBattery],
              ["Value", scoreValue, setScoreValue],
              ["Software", scoreSoftware, setScoreSoftware],
              ["Features", scoreFeatures, setScoreFeatures],
              ["Gaming", scoreGaming, setScoreGaming],
            ].map(([label, value, setter]: any) => (
              <div key={label}>
                <label className={labelClass}>{label}</label>
                <input type="number" lang="en" autoComplete="off" step="0.1" min="0" max="10" value={value} onChange={(e) => setter(e.target.value)} className={inputClass} />
              </div>
            ))}
          </div>

          <div><label className={labelClass}>نقاط القوة</label><textarea rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>نقاط الضعف</label><textarea rows={3} value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} className={inputClass} /></div>

          <div className="grid grid-cols-2 gap-6">
            <div><label className={labelClass}>تقييم ABDOU GSM</label><input type="number" lang="en" autoComplete="off" step="0.1" min="0" max="10" value={abdouScore} onChange={(e) => setAbdouScore(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>التوفر</label><input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Available" className={inputClass} /></div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={has5g} onChange={(e) => setHas5g(e.target.checked)} className="size-4 rounded border-input accent-primary" />
            يدعم 5G
          </label>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "جارٍ الحفظ..." : "حفظ الهاتف"}
        </button>
      </form>

      {showLibrary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="مكتبة الصور"
          onClick={() => setShowLibrary(false)}
        >
          <div className="max-h-[80vh] w-[900px] max-w-full overflow-auto rounded-2xl bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">مكتبة الصور</h2>
              <button onClick={() => setShowLibrary(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                إغلاق
              </button>
            </div>

            {libraryImages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">لا توجد صور في المكتبة بعد.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {libraryImages.map((img) => (
                  <img
                    key={img.name}
                    src={imageUrlFromStorage(img.name)}
                    alt={img.name}
                    className="aspect-square cursor-pointer rounded-xl bg-secondary/40 object-cover transition-opacity hover:opacity-80"
                    onClick={() => pickFromLibrary(img.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}