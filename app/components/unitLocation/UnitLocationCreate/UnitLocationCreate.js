"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/ui/Card/Card";
import Input from "@/app/components/ui/Input/Input";
import Button from "@/app/components/ui/Button/Button";
import Map from "@/app/components/ui/Map/Map";
import { API_ENDPOINTS } from "@/app/config/api";

export default function UnitLocationCreate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    isDefault: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.unitLocations.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در ایجاد واحد");
      }

      router.push("/dashboard/settings/unit-locations");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMapClick = ({ latitude, longitude }) => {
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude
    }));
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">افزودن واحد جدید</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="نام واحد"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            موقعیت روی نقشه
          </label>
          <Map
            center={formData.latitude && formData.longitude 
              ? [formData.latitude, formData.longitude] 
              : [35.7219, 51.3347]}
            markers={formData.latitude && formData.longitude ? [{
              latitude: formData.latitude,
              longitude: formData.longitude,
              name: formData.name || "موقعیت انتخاب شده"
            }] : []}
            onMapClick={handleMapClick}
            height="300px"
            showControls={true}
            draggable={true}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="عرض جغرافیایی"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            required
          />
          <Input
            label="طول جغرافیایی"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDefault"
            id="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="isDefault">واحد پیش‌فرض</label>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Card>
  );
} 