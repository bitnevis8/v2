"use client";

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';
import { useRouter } from 'next/navigation';

export default function RateSettingsList() {
  const router = useRouter();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.rateSettings.getAll);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات نرخ‌ها');
        const data = await response.json();
        setRates(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const handleEdit = (id) => {
    router.push(`/dashboard/settings/rate-settings/edit/${id}`);
  };

  const handleCreateClick = () => {
    router.push('/dashboard/settings/rate-settings/create');
  };

  const columns = [
    { header: 'نرخ (تومان)', accessor: 'ratePerKm', cell: (row) => Number(row.ratePerKm).toLocaleString('fa-IR') },
    { header: 'توضیحات', accessor: 'description' },
    { header: 'عملیات', accessor: 'actions', cell: (row) => (
      <div className="flex gap-2">
        <Button variant="secondary" size="small" onClick={() => handleEdit(row.id)}>ویرایش</Button>
        <Button variant="danger" size="small">حذف</Button>
      </div>
    ) },
  ];

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">لیست نرخ‌ها</h2>
        <Button variant="primary" onClick={handleCreateClick}>افزودن نرخ جدید</Button>
      </div>
      <Table columns={columns} data={rates} />
    </div>
  );
} 