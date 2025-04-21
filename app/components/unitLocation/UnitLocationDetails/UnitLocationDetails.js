"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/ui/Card/Card";
import Map from "@/app/components/ui/Map/Map";
import { API_ENDPOINTS } from "@/app/config/api";

export default function UnitLocationDetails({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(null);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.unitLocations.getById(id));
        
        if (!response.ok) {
          throw new Error("خطا در دریافت اطلاعات واحد");
        }

        const data = await response.json();
        setUnit(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id]);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!unit) return <div>واحد یافت نشد</div>;

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">جزئیات واحد</h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/settings/unit-locations/edit/${id}`)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              ویرایش
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              بازگشت
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">نام واحد</h3>
            <p>{unit.name}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">وضعیت</h3>
            <p>{unit.isDefault ? "پیش‌فرض" : "معمولی"}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">عرض جغرافیایی</h3>
            <p>{unit.latitude}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">طول جغرافیایی</h3>
            <p>{unit.longitude}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">موقعیت روی نقشه</h3>
          <Map
            center={[unit.latitude, unit.longitude]}
            markers={[{
              latitude: unit.latitude,
              longitude: unit.longitude,
              name: unit.name
            }]}
            height="300px"
            showControls={true}
            draggable={false}
          />
        </div>
      </div>
    </Card>
  );
} 