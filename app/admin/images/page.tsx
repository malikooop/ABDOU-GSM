"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { FileObject } from "@supabase/storage-js";

const MAX_FILE_SIZE_MB = 5;

export default function ImagesPage() {
  const [images, setImages] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.storage
      .from("phone-images")
      .list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      setError("تعذر تحميل الصور. حاول مرة أخرى.");
      setLoading(false);
      return;
    }

    setImages(data || []);
    setLoading(false);
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`حجم الصورة يجب أن يكون أقل من ${MAX_FILE_SIZE_MB} ميجابايت.`);
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from("phone-images").upload(fileName, file);

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    loadImages();
  }

  async function deleteImage(name: string) {
    if (!confirm("حذف الصورة؟")) return;

    setDeletingName(name);
    const { error } = await supabase.storage.from("phone-images").remove([name]);
    setDeletingName(null);

    if (error) {
      alert(error.message);
      return;
    }

    setImages((prev) => prev.filter((img) => img.name !== name));
  }

  function publicUrl(name: string) {
    return supabase.storage.from("phone-images").getPublicUrl(name).data.publicUrl;
  }

  async function copyLink(name: string) {
    try {
      await navigator.clipboard.writeText(publicUrl(name));
      alert("تم نسخ الرابط");
    } catch {
      alert("تعذر نسخ الرابط");
    }
  }

  const filteredImages = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return images;
    return images.filter((img) => img.name.toLowerCase().includes(text));
  }, [images, search]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">مكتبة الصور</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "جارٍ التحميل..." : `${filteredImages.length} صورة`}
          </p>
        </div>
        <button
          onClick={loadImages}
          disabled={loading}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          🔄 تحديث
        </button>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-border/60 pb-8">
        <label className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
          {uploading ? "جاري الرفع..." : "رفع صورة جديدة"}
          <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="hidden" />
        </label>
        <p className="text-xs text-muted-foreground">حد أقصى {MAX_FILE_SIZE_MB} ميجابايت</p>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {images.length > 0 && (
        <input
          type="text"
          placeholder="بحث باسم الصورة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8 w-full max-w-sm border-0 border-b border-border bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
        />
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">جارٍ تحميل الصور...</p>
      ) : filteredImages.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {images.length === 0 ? "لا توجد صور مرفوعة بعد." : "لا توجد نتائج مطابقة لبحثك."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {filteredImages.map((img) => (
            <div key={img.name} className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary/40">
              <Image src={publicUrl(img.name)} alt={img.name} fill unoptimized className="object-cover" />

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <button onClick={() => copyLink(img.name)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  نسخ
                </button>
                <button
                  onClick={() => deleteImage(img.name)}
                  disabled={deletingName === img.name}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                >
                  {deletingName === img.name ? "..." : "حذف"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}