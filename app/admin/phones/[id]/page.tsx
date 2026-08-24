"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { FileObject } from "@supabase/storage-js";

const MAX_FILE_SIZE_MB = 5;

const inputClass =
  "w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";
const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

export default function EditPhonePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");

  const [priceNew, setPriceNew] = useState("");
  const [priceUsed, setPriceUsed] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);

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

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryImages, setLibraryImages] = useState<FileObject[]>([]);
  const [uploadingLibraryImage, setUploadingLibraryImage] = useState(false);

  useEffect(() => {
    loadPhone();
  }, []);

  async function loadPhone() {
    setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase.from("phones").select("*").eq("id", id).single();

    if (error) {
      setLoadError("تعذر تحميل بيانات الهاتف.");
      setLoading(false);
      return;
    }

    if (data) {
      setBrand(data.brand ?? "");
      setModel(data.model ?? "");
      setCategory(data.category ?? "");
      setPriceNew(String(data.price_new ?? ""));
      setPriceUsed(data.price_used != null ? String(data.price_used) : "");
      setImageUrl(data.image_url ?? "");
      setDescription(data.description ?? "");
      setTopFeature(data.top_feature ?? "");
      setProcessor(data.processor ?? "");
      setRam(data.ram ?? "");
      setStorage(data.storage ?? "");
      setScreenSize(data.screen_size ?? "");
      setDisplayTech(data.display_tech ?? "");
      setBatteryCapacity(data.battery_capacity ?? "");
      setChargingSpeed(data.charging_speed ?? "");
      setMainCamera(data.main_camera ?? "");
      setOs(data.os ?? "");
      setReleaseDate(data.release_date ? String(String(data.release_date).slice(0, 4)) : "");
      setAvailability(data.availability ?? "");
      setHas5g(data.has_5g ?? true);
      setScorePerformance(String(data.score_performance ?? ""));
      setScoreCamera(String(data.score_camera ?? ""));
      setScoreDisplay(String(data.score_display ?? ""));
      setScoreBattery(String(data.score_battery ?? ""));
      setScoreValue(String(data.score_value ?? ""));
      setScoreSoftware(String(data.score_software ?? ""));
      setScoreFeatures(String(data.score_features ?? ""));
      setScoreGaming(String(data.score_gaming ?? ""));
      setStrengths(data.strengths ?? "");
      setWeaknesses(data.weaknesses ?? "");
      setAbdouScore(String(data.abdou_score ?? ""));
    }

    setLoading(false);
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

  async function uploadLibraryImage(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`حجم الصورة يجب أن يكون أقل من ${MAX_FILE_SIZE_MB} ميجابايت.`);
      return;
    }

    setUploadingLibraryImage(true);

    const extension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from("phone-images").upload(fileName, file);

    if (error) {
      alert(error.message);
      setUploadingLibraryImage(false);
      return;
    }

    await loadLibrary();
    setUploadingLibraryImage(false);
  }

  function imageUrlFromStorage(name: string) {
    return supabase.storage.from("phone-images").getPublicUrl(name).data.publicUrl;
  }

  function handleNewImageChange(e: React.ChangeEvent<HTMLInputElement>) {
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

    setNewImage(file);
  }

  function pickFromLibrary(name: string) {
    setImageUrl(imageUrlFromStorage(name));
    setNewImage(null);
    setShowLibrary(false);
  }

  async function deleteLibraryImage(name: string) {
    if (!confirm("هل تريد حذف الصورة؟")) return;

    const { error } = await supabase.storage.from("phone-images").remove([name]);

    if (error) {
      alert(error.message);
      return;
    }

    loadLibrary();
  }

  function validate(): string | null {
    if (!brand.trim()) return "الرجاء إدخال اسم الشركة.";
    if (!model.trim()) return "الرجاء إدخال الموديل.";
    if (!priceNew.trim() || Number(priceNew) <= 0) return "الرجاء إدخال سعر صالح للهاتف الجديد.";
    return null;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);

    try {
      let finalImage = imageUrl;

      if (newImage) {
        const oldImage = imageUrl ? imageUrl.split("/").pop() : null;
        if (oldImage) {
          await supabase.storage.from("phone-images").remove([oldImage]);
        }

        const extension = newImage.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("phone-images")
          .upload(fileName, newImage);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data } = supabase.storage.from("phone-images").getPublicUrl(fileName);
        finalImage = data.publicUrl;
      }

      const { error } = await supabase
        .from("phones")
        .update({
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
          image_url: finalImage,
        })
        .eq("id", Number(id));

      if (error) {
        alert(error.message);
        return;
      }

      alert("تم حفظ التعديلات");
      setImageUrl(finalImage);
      router.push("/admin/phones");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>;

  if (loadError) {
    return <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{loadError}</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-10 font-display text-2xl font-bold text-foreground">تعديل الهاتف</h1>

      <form onSubmit={save} className="space-y-14">
        {formError && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
        )}

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">الصورة</h2>

          {imageUrl ? (
            <img src={imageUrl} alt="Phone" className="h-48 w-full rounded-2xl bg-secondary/40 object-contain p-4" />
          ) : (
            <div className="rounded-2xl bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
              لا توجد صورة
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="cursor-pointer rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-foreground">
              تغيير الصورة
              <input type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={loadLibrary}
              disabled={libraryLoading}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {libraryLoading ? "..." : "اختر من المكتبة"}
            </button>
          </div>
          {newImage && <p className="text-sm text-muted-foreground">الصورة الجديدة: {newImage.name}</p>}
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">البيانات الأساسية</h2>
          <div><label className={labelClass}>الشركة</label><input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>الموديل</label><input value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>الفئة</label><input value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} /></div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">الأسعار</h2>
          <div className="grid grid-cols-2 gap-6">
            <div><label className={labelClass}>السعر الجديد</label><input type="number" lang="en" min="0" value={priceNew} onChange={(e) => setPriceNew(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>السعر المستعمل</label><input type="number" lang="en" min="0" value={priceUsed} onChange={(e) => setPriceUsed(e.target.value)} className={inputClass} /></div>
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
              <input type="number" lang="en" min="2000" max="2100" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={inputClass} />
            </div>
          </div>
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
                <label className={labelClass}>{label} ({value || 0})</label>
                <input type="range" min="0" max="10" step="0.1" value={value} onChange={(e) => setter(e.target.value)} className="w-full accent-primary" />
              </div>
            ))}
          </div>

          <div><label className={labelClass}>نقاط القوة</label><textarea rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>نقاط الضعف</label><textarea rows={3} value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} className={inputClass} /></div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>ABDOU GSM ({abdouScore || 0})</label>
              <input type="range" min="0" max="10" step="0.1" value={abdouScore} onChange={(e) => setAbdouScore(e.target.value)} className="w-full accent-primary" />
            </div>
            <div><label className={labelClass}>التوفر</label><input value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClass} /></div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={has5g} onChange={(e) => setHas5g(e.target.checked)} className="size-4 rounded border-input accent-primary" />
            يدعم 5G
          </label>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
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
          <div className="max-h-[85vh] w-[950px] max-w-full overflow-auto rounded-2xl bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">مكتبة الصور</h2>
              <button onClick={() => setShowLibrary(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                إغلاق
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4 border-b border-border/60 pb-6">
              <label className="cursor-pointer rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                {uploadingLibraryImage ? "جاري الرفع..." : "إضافة صورة للمكتبة"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingLibraryImage}
                  onChange={(e) => {
                    if (e.target.files?.[0]) uploadLibraryImage(e.target.files[0]);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {libraryImages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">لا توجد صور في المكتبة بعد.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {libraryImages.map((img) => (
                  <div key={img.name} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary/40">
                    <img
                      src={imageUrlFromStorage(img.name)}
                      alt={img.name}
                      className="h-full w-full cursor-pointer object-cover transition-transform group-hover:scale-105"
                      onClick={() => pickFromLibrary(img.name)}
                    />
                    <button
                      type="button"
                      onClick={() => deleteLibraryImage(img.name)}
                      className="absolute end-1.5 top-1.5 rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-red-600 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}