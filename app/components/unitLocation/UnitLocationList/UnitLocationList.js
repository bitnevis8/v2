"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/ui/Card/Card";
import Table from "@/app/components/ui/Table/Table";
import Button from "@/app/components/ui/Button/Button";
import { API_ENDPOINTS } from "@/app/config/api";

export default function UnitLocationList({ onView, onEdit, onDelete }) {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.unitLocations.getAll);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setUnits(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این واحد اطمینان دارید؟')) return;
    
    try {
      const response = await fetch(
        API_ENDPOINTS.unitLocations.delete(id),
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('خطا در حذف واحد');
      
      await fetchUnits();
      onDelete?.(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    {
      header: "عنوان",
      accessor: "name",
    },
    {
      header: "مختصات",
      accessor: "coordinates",
      cell: (row) => `${row.latitude}, ${row.longitude}`,
    },
    {
      header: "وضعیت",
      accessor: "isDefault",
      cell: (row) => row.isDefault ? "پیش‌فرض" : "-",
    },
    {
      header: "عملیات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => onView?.(row)}
            variant="secondary"
            size="small"
          >
            مشاهده
          </Button>
          <Button
            onClick={() => onEdit?.(row)}
            variant="secondary"
            size="small"
          >
            ویرایش
          </Button>
          <Button
            onClick={() => handleDelete(row.id)}
            variant="danger"
            size="small"
            disabled={row.isDefault}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">لیست واحدها</h2>
        <Button
          onClick={() => router.push('/dashboard/settings/unit-locations/create')}
          variant="primary"
        >
          افزودن واحد جدید
        </Button>
      </div>
      <Table
        columns={columns}
        data={units}
      />
    </Card>
  );
} 