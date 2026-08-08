"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">لوحة الإدارة</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "جارٍ التحميل..." : `${filteredPhones.length} هاتف`}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="بحث بالماركة، الموديل أو الفئة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={loadPhones}
          disabled={loading}
          className="shrink-0 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:shadow disabled:opacity-50"
        >
          🔄 تحديث
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">جارٍ تحميل الهواتف...</p>
      ) : filteredPhones.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-400">
          {phones.length === 0
            ? "لا توجد هواتف مضافة بعد."
            : "لا توجد نتائج مطابقة لبحثك."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-right text-black">الصورة</th>
                <th className="p-3 text-right text-black">الهاتف</th>
                <th className="p-3 text-right text-black">الفئة</th>
                <th className="p-3 text-right text-black">السعر</th>
                <th className="p-3 text-right text-black">ABDOU</th>
                <th className="p-3 text-center text-black">5G</th>
                <th className="p-3 text-right text-black">التوفر</th>
                <th className="p-3 text-right text-black">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="text-black">
              {filteredPhones.map((phone) => (
                <tr key={phone.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={phone.image_url || "/placeholder.png"}
                      className="h-20 w-20 rounded-lg border object-cover"
                      alt={`${phone.brand} ${phone.model}`}
                    />
                  </td>

                  <td className="p-3">
                    <div className="font-bold">{phone.brand}</div>
                    <div className="text-gray-600">{phone.model}</div>
                  </td>

                  <td className="p-3">{phone.category || "—"}</td>

                  <td className="p-3">
                    {phone.price_new != null
                      ? `${phone.price_new.toLocaleString()} دج`
                      : "—"}
                  </td>

                  <td className="p-3 font-bold text-blue-600">
                    {phone.abdou_score ?? "—"}
                  </td>

                  <td className="p-3 text-center">
                    {phone.has_5g ? "✅" : "❌"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        phone.availability === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {phone.availability || "—"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/phones/${phone.id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        تعديل
                      </Link>

                      <button
                        onClick={() => deletePhone(phone.id)}
                        disabled={deletingId === phone.id}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
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