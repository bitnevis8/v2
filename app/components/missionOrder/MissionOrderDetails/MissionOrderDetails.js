"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';
import moment from 'moment';
import jalaali from 'jalaali-js';
import L from 'leaflet';

// تنظیم آیکون‌های پیش‌فرض لیفلت در سطح ماژول
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Dynamic imports for react-leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const MissionOrderDetails = ({ missionOrderId }) => {
  const router = useRouter();
  const [missionOrder, setMissionOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);

  useEffect(() => {
    const fetchMissionOrder = async () => {
      try {
        setLoading(true);
        
        // Log the API endpoint being called
        console.log('Fetching mission order from:', API_ENDPOINTS.missionOrders.getById(missionOrderId));
        
        // Fetch mission order data
        const response = await fetch(API_ENDPOINTS.missionOrders.getById(missionOrderId));
        
        if (!response.ok) {
          throw new Error(`خطا در دریافت اطلاعات: ${response.status}`);
        }
        
        const data = await response.json();
        
        // دیباگ: نمایش نوع و محتوای destinations
        console.log('Destinations before processing:', 
          data.data.destinations, 
          'Type:', typeof data.data.destinations,
          'Is Array:', Array.isArray(data.data.destinations)
        );
        
        // اطمینان از اینکه destinations یک آرایه است
        if (data.data && data.data.destinations && !Array.isArray(data.data.destinations)) {
          console.log('Destinations is not an array, converting:', data.data.destinations);
          // تبدیل به آرایه اگر نیست (ممکن است یک آبجکت باشد)
          try {
            // اگر JSON باشد که به صورت رشته ذخیره شده
            if (typeof data.data.destinations === 'string') {
              data.data.destinations = JSON.parse(data.data.destinations);
              console.log('After parsing JSON string:', data.data.destinations);
            }
            
            // اطمینان از اینکه بعد از پارس، یک آرایه است
            if (!Array.isArray(data.data.destinations)) {
              data.data.destinations = [data.data.destinations];
              console.log('After converting to array:', data.data.destinations);
            }
          } catch (e) {
            console.error('Error parsing destinations:', e);
            data.data.destinations = []; // در صورت خطا، آرایه خالی قرار می‌دهیم
          }
        }
        
        // دیباگ: نمایش نوع و محتوای نهایی destinations
        console.log('Destinations after processing:', 
          data.data.destinations, 
          'Type:', typeof data.data.destinations,
          'Is Array:', Array.isArray(data.data.destinations)
        );
        
        setMissionOrder(data.data);
        
        // If we have destinations, fetch unit location data to get origin coordinates
        if (data.data.fromUnit) {
          const unitResponse = await fetch(API_ENDPOINTS.unitLocations.getAll);
          
          if (unitResponse.ok) {
            const unitData = await unitResponse.json();
            const origin = unitData.data.find(unit => unit.name === data.data.fromUnit);
            
            if (origin) {
              setOriginCoords([origin.latitude, origin.longitude]);
              
              // If we have destinations, calculate route
              if (data.data.destinations && data.data.destinations.length > 0) {
                calculateRoute(origin, data.data.destinations);
              }
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching mission order details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (missionOrderId) {
      fetchMissionOrder();
    }
  }, [missionOrderId]);

  useEffect(() => {
    // اضافه کردن کنترل جستجو به نقشه
    if (typeof window !== 'undefined') {
      const map = document.querySelector('.leaflet-container')?.__leaflet_map;
      if (map) {
        // اضافه کردن کنترل جستجو
        const searchControl = L.Control.geocoder({
          position: 'topleft',
          placeholder: 'جستجوی مکان...',
          searchLabel: 'جستجو',
          notFoundMessage: 'مکانی یافت نشد',
          errorMessage: 'خطا در جستجو',
          showResultIcons: true,
          suggestMinLength: 3,
          suggestTimeout: 250,
          queryMinLength: 1,
          defaultMarkGeocode: false,
          geocoder: L.Control.Geocoder.nominatim({
            geocodingQueryParams: {
              countrycodes: 'ir',
              limit: 5,
              'accept-language': 'fa'
            }
          })
        });
        map.addControl(searchControl);
      }
    }
  }, []);

  const calculateRoute = async (origin, destinations) => {
    try {
      // اطمینان از اینکه destinations یک آرایه است
      if (!Array.isArray(destinations)) {
        console.log('Destinations is not an array in calculateRoute, converting:', destinations);
        destinations = Array.isArray(destinations) ? destinations : [];
      }
      
      // بررسی میکنیم که آیا آرایه destinations خالی نیست
      if (destinations.length === 0) {
        console.log('No destinations to calculate route');
        return;
      }
      
      // ساخت آرایه نقاط مسیر رفت با فرمت صحیح
      const waypoints = [
        [origin.longitude, origin.latitude],
        ...destinations.map(dest => [dest.lng, dest.lat])
      ];
      
      // تبدیل نقاط به رشته با فرمت مورد نیاز OSRM
      const waypointsStr = waypoints
        .map(point => `${point[0]},${point[1]}`)
        .join(';');
      
      console.log('Waypoints for route calculation:', waypointsStr);
      
      // محاسبه مسیر رفت
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching route: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.routes && data.routes[0]) {
        // تنظیم مسیر رفت برای نمایش روی نقشه
        const forwardRoute = data.routes[0].geometry.coordinates.map((coord) => [
          coord[1], // latitude
          coord[0]  // longitude
        ]);
        
        // محاسبه مسافت و زمان رفت
        const forwardDistance = data.routes[0].distance / 1000; // تبدیل به کیلومتر
        const forwardDuration = data.routes[0].duration / 3600; // تبدیل به ساعت

        // محاسبه مسیر برگشت از آخرین مقصد به مبدا
        const lastDestination = destinations[destinations.length - 1];
        const returnWaypointsStr = `${lastDestination.lng},${lastDestination.lat};${origin.longitude},${origin.latitude}`;
        
        const returnResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${returnWaypointsStr}?overview=full&geometries=geojson`
        );

        if (!returnResponse.ok) {
          throw new Error(`Error fetching return route: ${returnResponse.status}`);
        }

        const returnData = await returnResponse.json();
        
        if (returnData.routes && returnData.routes[0]) {
          // تنظیم مسیر برگشت برای نمایش روی نقشه
          const returnRoute = returnData.routes[0].geometry.coordinates.map((coord) => [
            coord[1], // latitude
            coord[0]  // longitude
          ]);

          // محاسبه مسافت و زمان برگشت
          const returnDistance = returnData.routes[0].distance / 1000; // تبدیل به کیلومتر
          const returnDuration = returnData.routes[0].duration / 3600; // تبدیل به ساعت

          // به‌روزرسانی state با مسیرها و محاسبات جدید
          setRoute({
            forward: forwardRoute,
            return: returnRoute
          });
          
          // به‌روزرسانی مقادیر در state
          setMissionOrder(prev => ({
            ...prev,
            distance: forwardDistance.toFixed(2),
            roundTripDistance: (forwardDistance + returnDistance).toFixed(2),
            estimatedTime: forwardDuration.toFixed(2),
            estimatedReturnTime: (forwardDuration + returnDuration).toFixed(2)
          }));
        }
      } else {
        console.error('No route found in response');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.missionOrders.delete(missionOrderId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`خطا در حذف حکم ماموریت: ${response.status}`);
      }

      router.push('/dashboard/missionOrder');
    } catch (err) {
      console.error("Error deleting mission order:", err);
      setError(err.message);
    }
  };

  const formatPersianDate = (dateString) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const persianDate = jalaali.toJalaali(year, month, day);
      return `${persianDate.jy}/${String(persianDate.jm).padStart(2, '0')}/${String(persianDate.jd).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
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
        <Button 
          variant="secondary" 
          className="mt-4"
          onClick={() => router.push('/dashboard/missionOrder')}
        >
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  if (!missionOrder) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg my-4">
        <p>حکم ماموریت مورد نظر یافت نشد.</p>
        <Button 
          variant="secondary" 
          className="mt-4"
          onClick={() => router.push('/dashboard/missionOrder')}
        >
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  const mapCenter = missionOrder.destinations && missionOrder.destinations.length > 0 
    ? [missionOrder.destinations[0].lat, missionOrder.destinations[0].lng]
    : originCoords || [31.348808655624506, 48.72288275224326]; // Default coordinates if none available

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full sm:max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">جزئیات حکم ماموریت</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/missionOrder')}
            >
              بازگشت به لیست
            </Button>
            <Link href={`/dashboard/missionOrder/edit/${missionOrderId}`}>
              <Button variant="primary">ویرایش</Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              حذف
            </Button>
          </div>
        </div>

        {/* نقشه */}
        <div className="w-full h-[400px] border rounded-lg mb-6">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {originCoords && <Marker position={originCoords} />}
            {missionOrder?.destinations?.map((dest, index) => (
              <Marker key={index} position={[dest.lat, dest.lng]} />
            ))}
            {route?.forward && <Polyline positions={route.forward} color="blue" weight={3} />}
            {route?.return && <Polyline positions={route.return} color="red" weight={3} />}
          </MapContainer>
        </div>

        {/* اطلاعات مسیر */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">اطلاعات مسیر</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مسافت کل مسیر (کیلومتر)</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.distance || '0'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مسافت رفت و برگشت (کیلومتر)</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.roundTripDistance || '0'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت (ساعت)</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.estimatedTime || '0'} ساعت</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت و برگشت (ساعت)</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.estimatedReturnTime || '0'} ساعت</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نرخ به ازای هر کیلومتر (تومان)</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.ratePerKm || '2500'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">هزینه نهایی (تومان)</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.finalCost || '0'}</div>
            </div>
          </div>
        </div>

        {/* اطلاعات ماموریت */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">اطلاعات ماموریت</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد شماره صورت جلسه</label>
              <div className="bg-white p-2 rounded border border-gray-200">{missionOrder.sessionCode || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
              <input
                type="text"
                value={formatPersianDate(missionOrder?.day)}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">واحد مبدا</label>
              <input
                type="text"
                value={missionOrder?.fromUnit || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <input
                type="text"
                value={missionOrder?.firstName || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <input
                type="text"
                value={missionOrder?.lastName || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
              <input
                type="text"
                value={missionOrder?.personnelNumber || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
              <input
                type="text"
                value={missionOrder?.time || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع ماموریت</label>
              <input
                type="text"
                value={missionOrder?.missionSubject || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">همراهان</label>
              <input
                type="text"
                value={missionOrder?.companions || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع وسیله نقلیه</label>
              <input
                type="text"
                value={missionOrder?.transport || ''}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وزن کل (کیلوگرم)</label>
              <input
                type="text"
                value={missionOrder?.totalWeightKg || '0'}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات ماموریت</label>
              <textarea
                value={missionOrder?.missionDescription || ''}
                readOnly
                rows="4"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal تایید حذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تایید حذف</h3>
            <p className="text-gray-600 mb-4">آیا از حذف این حکم ماموریت اطمینان دارید؟</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                انصراف
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionOrderDetails; 