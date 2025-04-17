"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';

const MissionOrderDelete = ({ missionOrderId, onCancel }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.missionOrders.delete(missionOrderId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در حذف حکم ماموریت');
      }

      // Navigate back to mission orders list
      router.push('/dashboard/missionOrder');
      router.refresh();
      
    } catch (err) {
      console.error("Error deleting mission order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">حذف حکم ماموریت</h2>
      
      <p className="mb-6 text-gray-600">
        آیا از حذف این حکم ماموریت اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
      </p>
      
      {error && (
        <div className="bg-rose-100 text-rose-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-4 space-x-reverse">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          انصراف
        </Button>
        
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'در حال حذف...' : 'حذف'}
        </Button>
      </div>
    </div>
  );
};

export default MissionOrderDelete; 