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
        `id, brand, model, category, price_new, image_url, abdou_score, availability, has_5g`
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة الإدارة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "جارٍ التحميل..." : `${filteredPhones.length} هاتف`}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-8 flex items-center gap-4">
        <input
          type="text"
          placeholder="بحث بالماركة، الموديل أو الفئة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border-0 border-b border-border bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
        />
        <button
          onClick={loadPhones}
          disabled={loading}
          className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          🔄 تحديث
        </button>
        <Link
          href="/admin/phones/bulk-import"
          className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          📥 رفع جماعي
        </Link>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">جارٍ تحميل الهواتف...</p>
      ) : filteredPhones.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {phones.length === 0 ? "لا توجد هواتف مضافة بعد." : "لا توجد نتائج مطابقة لبحثك."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-start text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">الهاتف</th>
                <th className="px-4 py-3 text-start font-medium">الفئة</th>
                <th className="px-4 py-3 text-start font-medium">السعر</th>
                <th className="px-4 py-3 text-start font-medium">ABDOU</th>
                <th className="px-4 py-3 text-start font-medium">5G</th>
                <th className="px-4 py-3 text-start font-medium">التوفر</th>
                <th className="px-4 py-3 text-start font-medium">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 bg-card">
              {filteredPhones.map((phone) => (
                <tr key={phone.id} className="text-foreground">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                        <Image
                          src={phone.image_url || "/placeholder.png"}
                          alt={`${phone.brand} ${phone.model}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{phone.brand}</div>
                        <div className="text-muted-foreground">{phone.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{phone.category || "—"}</td>
                  <td className="px-4 py-4">
                    {phone.price_new != null ? `${formatNumber(phone.price_new)} دج` : "—"}
                  </td>
                  <td className="px-4 py-4 font-semibold text-primary">{phone.abdou_score ?? "—"}</td>
                  <td className="px-4 py-4 text-center">{phone.has_5g ? "✓" : "—"}</td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        phone.availability === "Available"
                          ? "inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400"
                          : "inline-flex items-center gap-1.5 font-medium text-red-500"
                      }
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          phone.availability === "Available" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {phone.availability || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/admin/phones/${phone.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() => deletePhone(phone.id)}
                        disabled={deletingId === phone.id}
                        className="font-medium text-destructive hover:underline disabled:opacity-50"
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