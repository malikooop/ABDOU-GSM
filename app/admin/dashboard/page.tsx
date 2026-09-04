"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatNumber } from "@/lib/format";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

type Phone = {
  id: number;
  brand: string;
  model: string;
  category: string | null;
  price_new: number | null;
  image_url: string | null;
  abdou_score: number | null;
  availability: string | null;
  has_5g: boolean;
};

export default function Dashboard() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadPhones();
  }, []);

  async function loadPhones() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("phones")
      .select(
        `
        id,
        brand,
        model,
        category,
        price_new,
        image_url,
        abdou_score,
        availability,
        has_5g
      `
      )
      .order("id");

    if (error) {
      setError("تعذر تحميل قائمة الهواتف. حاول مرة أخرى.");
      setLoading(false);
      return;
    }

    setPhones(data || []);
    setLoading(false);
  }

  async function deletePhone(id: number) {
    if (!confirm("هل تريد حذف الهاتف؟")) return;

    setDeletingId(id);

    const { error } = await supabase.from("phones").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setPhones((prev) => prev.filter((p) => p.id !== id));
  }

  const filteredPhones = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return phones;

    return phones.filter(
      (phone) =>
        phone.brand.toLowerCase().includes(text) ||
        phone.model.toLowerCase().includes(text) ||
        phone.category?.toLowerCase().includes(text)
    );
  }, [phones, search]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة الإدارة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "جارٍ التحميل..." : `${filteredPhones.length} هاتف`}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="بحث بالماركة، الموديل أو الفئة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={loadPhones}
          disabled={loading}
          className="shrink-0 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-elevation-sm transition-colors duration-200 hover:bg-secondary disabled:opacity-50"
        >
          تحديث
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">جارٍ تحميل الهواتف...</p>
      ) : filteredPhones.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {phones.length === 0
            ? "لا توجد هواتف مضافة بعد."
            : "لا توجد نتائج مطابقة لبحثك."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-elevation-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">الصورة</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">الهاتف</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">الفئة</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">السعر</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">ABDOU</th>
                <th className="p-3 text-center text-xs font-semibold text-muted-foreground">5G</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">التوفر</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredPhones.map((phone) => (
                <tr key={phone.id} className="border-t border-border transition-colors duration-150 hover:bg-secondary/40">
                  <td className="p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                      <Image
                        src={phone.image_url || "/placeholder.svg"}
                        alt={`${phone.brand} ${phone.model}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-foreground">{phone.brand}</div>
                    <div className="text-sm text-muted-foreground">{phone.model}</div>
                  </td>

                  <td className="p-3 text-sm text-foreground">{phone.category || "—"}</td>

                  <td className="p-3 text-sm text-foreground">
                   {phone.price_new != null
                   ? `${formatNumber(phone.price_new)} دج`
                        : "—"}
                      </td>

                  <td className="p-3 text-sm font-bold text-primary">
                    {phone.abdou_score ?? "—"}
                  </td>

                  <td className="p-3 text-center text-sm">
                    {phone.has_5g ? "✅" : "—"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        phone.availability === "Available"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {phone.availability || "—"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/phones/${phone.id}`}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-hover"
                      >
                        تعديل
                      </Link>

                      <button
                        onClick={() => deletePhone(phone.id)}
                        disabled={deletingId === phone.id}
                        className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-destructive/90 disabled:opacity-50"
                      >
                        {deletingId === phone.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}