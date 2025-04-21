import { useState } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';

export default function RateSettingsCreate() {
  const [ratePerKm, setRatePerKm] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.rateSettings.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ratePerKm, description }),
      });
      if (!response.ok) throw new Error('خطا در ایجاد نرخ جدید');
      // Handle success (e.g., redirect or show success message)
      alert('نرخ جدید با موفقیت ایجاد شد!'); // Show success alert
      setRatePerKm(''); // Reset rate input
      setDescription(''); // Reset description input
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800">ایجاد نرخ جدید</h2>
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
      {error && <div className="text-red-500">{error}</div>}
      <Button variant="primary" onClick={handleCreate} disabled={loading}>
        {loading ? 'در حال ایجاد...' : 'ایجاد'}
      </Button>
    </div>
  );
} 