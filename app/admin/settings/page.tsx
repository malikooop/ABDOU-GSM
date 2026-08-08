"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground outline-none focus:border-primary";
const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  async function loadSettings() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.from("settings").select("*").limit(1).single();

    if (error) {
      setError("تعذر تحميل الإعدادات. حاول تحديث الصفحة.");
      setLoading(false);
      return;
    }

    if (data) {
      setSiteName(data.site_name ?? "");
      setSiteDescription(data.site_description ?? "");
      setFacebook(data.facebook ?? "");
      setInstagram(data.instagram ?? "");
      setYoutube(data.youtube ?? "");
      setPhone(data.contact_phone ?? "");
      setEmail(data.contact_email ?? "");
      setAddress(data.contact_address ?? "");
      setLogoUrl(data.logo_url ?? "");
    }

    setLoading(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح.");
      return;
    }

    setNewLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let finalLogo = logoUrl;

      if (newLogo) {
        if (logoUrl) {
          const oldFileName = logoUrl.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("site-assets").remove([oldFileName]);
          }
        }

        const extension = newLogo.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(fileName, newLogo);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data } = supabase.storage.from("site-assets").getPublicUrl(fileName);
        finalLogo = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("settings")
        .update({
          site_name: siteName,
          site_description: siteDescription,
          facebook,
          instagram,
          youtube,
          contact_phone: phone,
          contact_email: email,
          contact_address: address,
          logo_url: finalLogo,
        })
        .eq("id", 1);

      if (updateError) {
        alert(updateError.message);
        return;
      }

      setLogoUrl(finalLogo);
      setNewLogo(null);
      setLogoPreview(null);
      alert("تم حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-10 font-display text-2xl font-bold text-foreground">إعدادات الموقع</h1>

      {error && (
        <div className="mb-8 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={save} className="space-y-14">
        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">الشعار</h2>
          {(logoPreview || logoUrl) && (
            <img src={logoPreview || logoUrl} className="h-16 rounded-xl bg-secondary/40 p-2" alt="Logo" />
          )}
          <input type="file" accept="image/*" onChange={handleLogoChange} className={inputClass} />
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">معلومات عامة</h2>
          <div>
            <label className={labelClass}>اسم الموقع</label>
            <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>وصف الموقع</label>
            <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={3} className={inputClass} />
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">روابط التواصل الاجتماعي</h2>
          <div><label className={labelClass}>Facebook</label><input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Instagram</label><input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>YouTube</label><input value={youtube} onChange={(e) => setYoutube(e.target.value)} className={inputClass} /></div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">معلومات التواصل</h2>
          <div><label className={labelClass}>رقم الهاتف</label><input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={inputClass} /></div>
          <div><label className={labelClass}>البريد الإلكتروني</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} /></div>
          <div><label className={labelClass}>العنوان</label><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} /></div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}