"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import moment from 'moment-jalaali';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';

const MissionOrderList = () => {
  const [missionOrders, setMissionOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMissionOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.missionOrders.getAll);
        
        if (!response.ok) {
          throw new Error(`Error fetching mission orders: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Mission orders data:', data.data);
        
        // Process destinations for each order
        const processedOrders = data.data.map(order => {
          let destinations = [];
          try {
            if (order.destinations) {
              destinations = typeof order.destinations === 'string' 
                ? JSON.parse(order.destinations) 
                : order.destinations;
              
              if (!Array.isArray(destinations)) {
                destinations = [destinations];
              }
            }
            return { ...order, destinations };
          } catch (e) {
            console.error('Error processing destinations for order:', order.id, e);
            return { ...order, destinations: [] };
          }
        });
        
        setMissionOrders(processedOrders || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching mission orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionOrders();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این حکم ماموریت اطمینان دارید؟')) {
      try {
        const response = await fetch(API_ENDPOINTS.missionOrders.delete(id), {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error deleting mission order: ${response.status}`);
        }

        // Remove the deleted mission order from state
        setMissionOrders(missionOrders.filter(order => order.id !== id));
      } catch (err) {
        console.error("Error deleting mission order:", err);
        alert(`خطا در حذف حکم ماموریت: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-100 text-rose-700 p-4 rounded-lg my-4">
        <p className="font-medium">خطا در بارگیری اطلاعات</p>
        <p>{error}</p>
      </div>
    );
  }

  const columns = [
    {
      header: "ردیف",
      accessor: "rowNumber",
      cell: (row, index) => index + 1,
    },
    {
      header: "نام و نام خانوادگی",
      accessor: "fullName",
      cell: (row) => (
        <div>
          <div className="text-sm text-gray-900">{`${row.firstName || ''} ${row.lastName || ''}`}</div>
          {row.personnelNumber && (
            <div className="text-xs text-gray-500">{`کد پرسنلی: ${row.personnelNumber}`}</div>
          )}
        </div>
      ),
    },
    {
      header: "ماموریت",
      accessor: "missionSubject",
      cell: (row) => <div className="text-sm font-medium text-gray-900">{row.missionSubject || 'بدون عنوان'}</div>,
    },
    {
      header: "تاریخ",
      accessor: "day",
      cell: (row) => (
        <div>
          <div className="text-sm text-gray-900">
            {row.day ? moment(row.day).format('jYYYY/jMM/jDD') : '-'}
          </div>
          {row.time && <div className="text-xs text-gray-500">ساعت: {row.time}</div>}
        </div>
      ),
    },
    {
      header: "مبدا",
      accessor: "fromUnit",
      cell: (row) => <div className="text-sm text-gray-900">{row.fromUnit || '-'}</div>,
    },
    {
      header: "مقصد",
      accessor: "destinations",
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {row.destinations && row.destinations.length > 0
            ? `${row.destinations.length} مقصد`
            : '-'}
        </div>
      ),
    },
    {
      header: "عملیات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/missionOrder/${row.id}`}>
            <Button variant="secondary" size="small">
              مشاهده
            </Button>
          </Link>
          <Link href={`/dashboard/missionOrder/edit/${row.id}`}>
            <Button variant="secondary" size="small">
              ویرایش
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="small" 
            onClick={() => handleDelete(row.id)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">حکم‌های ماموریت</h1>
        <Link href="/dashboard/missionOrder/create">
          <Button variant="primary">
            ایجاد حکم ماموریت جدید
          </Button>
        </Link>
      </div>

      {missionOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">هیچ حکم ماموریتی یافت نشد.</p>
          <Link href="/dashboard/missionOrder/create">
            <Button variant="primary">
              ایجاد اولین حکم ماموریت
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column.accessor} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {missionOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.accessor} className="px-6 py-4 whitespace-nowrap">
                        {column.cell(order, index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {missionOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.missionSubject || 'بدون عنوان'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {`${order.firstName || ''} ${order.lastName || ''}`}
                        {order.personnelNumber && ` - کد پرسنلی: ${order.personnelNumber}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/missionOrder/${order.id}`}>
                        <Button variant="secondary" size="small">
                          مشاهده
                        </Button>
                      </Link>
                      <Link href={`/dashboard/missionOrder/edit/${order.id}`}>
                        <Button variant="secondary" size="small">
                          ویرایش
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="small" 
                        onClick={() => handleDelete(order.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">تاریخ</p>
                      <p className="text-gray-900">
                        {order.day ? moment(order.day).format('jYYYY/jMM/jDD') : '-'}
                        {order.time && <span className="text-gray-500 mr-2">ساعت: {order.time}</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">مبدا</p>
                      <p className="text-gray-900">{order.fromUnit || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">مقصد</p>
                      <p className="text-gray-900">
                        {order.destinations && order.destinations.length > 0
                          ? `${order.destinations.length} مقصد`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionOrderList; 