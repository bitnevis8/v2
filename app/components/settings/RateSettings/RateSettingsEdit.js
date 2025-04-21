import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';

export default function RateSettingsEdit({ id }) {
  const router = useRouter();
  const [ratePerKm, setRatePerKm] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.rateSettings.getById(id));
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات نرخ');
        const responseData = await response.json();
        if (responseData && responseData.data) {
          setRatePerKm(responseData.data.ratePerKm);
          setDescription(responseData.data.description);
        } else {
          throw new Error('ساختار پاسخ دریافتی نامعتبر است');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [id]);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.rateSettings.update(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ratePerKm, description }),
      });
      if (!response.ok) throw new Error('خطا در به‌روزرسانی نرخ');
      // Handle success (e.g., redirect or show success message)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800">ویرایش نرخ</h2>
      <div className="mb-4">
        <label className="block text-gray-700">نرخ به ازای کیلومتر:</label>
        <input
          type="number"
          value={ratePerKm}
          onChange={(e) => setRatePerKm(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">توضیحات:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <Button variant="primary" onClick={handleUpdate} disabled={loading}>
        {loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
      </Button>
    </div>
  );
} 