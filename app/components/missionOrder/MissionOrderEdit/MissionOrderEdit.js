"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import 'leaflet/dist/leaflet.css';
import { useMapEvents } from 'react-leaflet';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import jalaali from 'jalaali-js';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';
import LeafletConfig from '@/app/components/map/LeafletConfig';
import SearchBox from '@/app/components/ui/Map/SearchBox';
import { calculateRouteDetails, calculateFinalCost } from '@/app/utils/routeCalculations';

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

// کامپوننت برای هندل کردن رویداد کلیک روی نقشه
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      console.log('Map clicked:', e.latlng);
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MissionOrderEdit = ({ missionOrderId }) => {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      personnelNumber: '',
      fromUnit: '',
      day: '',
      time: '',
      missionLocation: '',
      missionCoordinates: '',
      missionSubject: '',
      missionDescription: '',
      companions: '',
      transport: '',
      totalWeightKg: '',
      destinations: [],
      distance: '',
      roundTripDistance: '',
      estimatedTime: '',
      estimatedReturnTime: '',
      sessionCode: '',
      finalCost: 0
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [route, setRoute] = useState(null);
  const [unitLocations, setUnitLocations] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [defaultRate, setDefaultRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([31.3488, 48.7228]); // Default to AryaFoulad initially

  const handleSearchSelect = (coords) => {
    setMapCenter(coords);
  };

  const handleDateChange = (date) => {
    if (date) {
      try {
        // اگر تاریخ به صورت Date object باشد
        if (date instanceof Date) {
          const persianDate = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
          };
          setValue('day', persianDate);
        } else {
          // اگر تاریخ به صورت object باشد
          setValue('day', date);
        }
      } catch (error) {
        console.error('Error handling date:', error);
        setValue('day', null);
      }
    }
  };

  // Fetch default rate (ID 1)
  useEffect(() => {
    const fetchDefaultRate = async () => {
      setRateLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.rateSettings.getById(1));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data && data.data.ratePerKm) {
          setDefaultRate(parseFloat(data.data.ratePerKm));
        } else {
          console.warn('Default rate (ID 1) not found or invalid, using default 0');
          setDefaultRate(0);
        }
      } catch (error) {
        console.error("Error fetching default rate:", error);
        setDefaultRate(0);
      } finally {
        setRateLoading(false);
      }
    };
    fetchDefaultRate();
  }, []);

  // Fetch mission order details and unit locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        // Fetch mission order
        const orderResponse = await fetch(API_ENDPOINTS.missionOrders.getById(missionOrderId));
        if (!orderResponse.ok) {
          throw new Error(`خطا در دریافت اطلاعات ماموریت: ${orderResponse.status}`);
        }
        const orderData = await orderResponse.json();
        const missionOrder = orderData.data;
        
        // Fetch unit locations
        const locationsResponse = await fetch(API_ENDPOINTS.unitLocations.getAll);
        if (!locationsResponse.ok) {
          throw new Error(`خطا در دریافت اطلاعات واحدها: ${locationsResponse.status}`);
        }
        const locationsData = await locationsResponse.json();
        const units = locationsData.data || [];
        setUnitLocations(units);
        
        // Find the selected unit and set initial map center
        const unit = units.find(u => u.name === missionOrder.fromUnit);
        if (unit) {
          setSelectedUnit(unit);
          setMapCenter([unit.latitude, unit.longitude]); // Set initial map center
        } else {
          console.warn('Unit not found, using default map center');
          // Keep the default mapCenter if unit not found
        }
        
        // Process destinations
        let processedDestinations = [];
        if (missionOrder.destinations) {
          try {
            processedDestinations = typeof missionOrder.destinations === 'string' 
              ? JSON.parse(missionOrder.destinations) 
              : missionOrder.destinations;
            
            if (!Array.isArray(processedDestinations)) {
              processedDestinations = [processedDestinations];
            }
            
            processedDestinations = processedDestinations.map(dest => ({
              lat: parseFloat(dest.lat),
              lng: parseFloat(dest.lng),
              title: dest.title || ''
            }));
          } catch (e) {
            console.error('Error processing destinations:', e);
            processedDestinations = [];
          }
        }
        
        setDestinations(processedDestinations);
        
        // Reset form with mission order data 
        const { ratePerKm, ...orderDataToReset } = missionOrder;
        reset({
          ...orderDataToReset,
          destinations: processedDestinations,
          fromUnit: unit ? unit.name : '', // Handle case where unit might not be found
          day: missionOrder.day ? new Date(missionOrder.day) : null
        });
        
        // Calculate route if needed (logic might need adjustment based on when rate is available)
        if (unit && processedDestinations.length > 0 && !rateLoading && defaultRate !== null) {
           await calculateRoute(unit, processedDestinations, defaultRate);
        }
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || 'خطا در بارگیری اطلاعات');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (missionOrderId) {
      fetchData();
    }
  }, [missionOrderId, reset, rateLoading, defaultRate]);

  useEffect(() => {
    // Recalculate route when rate is loaded and data is ready
    if (!rateLoading && defaultRate !== null && initialLoading === false && selectedUnit && destinations.length > 0) {
      calculateRoute(selectedUnit, destinations, defaultRate);
    }
  }, [rateLoading, defaultRate, initialLoading, selectedUnit, destinations]);

  const calculateRoute = async (origin, destinations, currentRate) => {
    if (currentRate === null) {
      console.log("Rate not available for calculation.");
      return; 
    }
    try {
      const routeDetails = await calculateRouteDetails(origin, destinations);
      
      // به‌روزرسانی state با مسیرها و محاسبات جدید
      setRoute({
        forward: routeDetails.forwardRoute,
        return: routeDetails.returnRoute
      });
      
      // به‌روزرسانی مقادیر در state
      setValue('forwardDistance', routeDetails.forwardDistance);
      setValue('returnDistance', routeDetails.returnDistance);
      setValue('totalDistance', routeDetails.totalDistance);
      setValue('forwardTime', routeDetails.forwardTime);
      setValue('returnTime', routeDetails.returnTime);
      setValue('totalTime', routeDetails.totalTime);
      
      // محاسبه هزینه نهایی
      const finalCost = calculateFinalCost(routeDetails.totalDistance, currentRate);
      setValue('finalCost', finalCost);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleUnitChange = async (e) => {
    const unitId = parseInt(e.target.value);
    const unit = unitLocations.find(u => u.id === unitId);
    setSelectedUnit(unit);
    setValue('fromUnit', unit.name);
    if (unit) {
      setMapCenter([unit.latitude, unit.longitude]); // Set map center on unit change
    }
    
    if (destinations.length > 0 && unit && !rateLoading && defaultRate !== null) {
      await calculateRoute(unit, destinations, defaultRate);
    }
  };

  const handleLocationSelect = async (newDestination) => {
    console.log('Location selected:', newDestination);
    if (!selectedUnit || rateLoading || defaultRate === null) {
      alert('لطفاً ابتدا واحد مبدا را انتخاب کنید یا منتظر بارگذاری نرخ باشید.');
      return;
    }
    try {
      // Get location title 
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newDestination.lat}&lon=${newDestination.lng}`
      );
      const data = await response.json();
      const locationTitle = data.display_name || '';

      const newDestinationObj = {
        lat: newDestination.lat,
        lng: newDestination.lng,
        title: locationTitle
      };

      const updatedDestinations = [...destinations, newDestinationObj];
      setDestinations(updatedDestinations);
      setValue('destinations', updatedDestinations);
      
      setValue('missionCoordinates', `${newDestination.lat.toFixed(6)}, ${newDestination.lng.toFixed(6)}`);
      setValue('missionLocation', locationTitle);

      await calculateRoute(selectedUnit, updatedDestinations, defaultRate);
    } catch (error) {
      console.error('Error getting location details or calculating route:', error);
    }
  };

  const removeDestination = async (index) => {
    const updatedDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(updatedDestinations);
    setValue('destinations', updatedDestinations);
    
    if (updatedDestinations.length > 0) {
      const lastDest = updatedDestinations[updatedDestinations.length - 1];
      setValue('missionCoordinates', `${lastDest.lat.toFixed(6)}, ${lastDest.lng.toFixed(6)}`);
      setValue('missionLocation', lastDest.title);
      if (selectedUnit && !rateLoading && defaultRate !== null) {
          await calculateRoute(selectedUnit, updatedDestinations, defaultRate);
      }
    } else {
      setValue('missionCoordinates', '');
      setValue('missionLocation', '');
      setRoute(null);
      // Reset calculated values
      setValue('forwardDistance', 0);
      setValue('returnDistance', 0);
      setValue('totalDistance', 0);
      setValue('forwardTime', 0);
      setValue('returnTime', 0);
      setValue('totalTime', 0);
      setValue('finalCost', 0);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    // Prepare data for submission (remove ratePerKm if present)
    const { ratePerKm, ...submitData } = data;
    
    // Format date correctly if it's a Date object or our custom object
    let formattedDay = null;
    if (submitData.day instanceof Date) {
        const year = submitData.day.getFullYear();
        const month = String(submitData.day.getMonth() + 1).padStart(2, '0');
        const day = String(submitData.day.getDate()).padStart(2, '0');
        formattedDay = `${year}-${month}-${day}`;
    } else if (submitData.day && typeof submitData.day === 'object' && submitData.day.year) {
        // Assuming it's the DatePicker object
        try {
            const gregorianDate = jalaali.toGregorian(submitData.day.year, submitData.day.month.number, submitData.day.day);
            formattedDay = `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, '0')}-${String(gregorianDate.gd).padStart(2, '0')}`;
        } catch (e) {
            console.error("Error converting date for submit:", e);
            // Fallback or error handling needed
        }
    }

    const finalSubmitData = {
        ...submitData,
        day: formattedDay,
        destinations: JSON.stringify(submitData.destinations || [])
    };

    try {
      const response = await fetch(API_ENDPOINTS.missionOrders.update(missionOrderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(finalSubmitData),
      });

      if (response.ok) {
        alert('حکم ماموریت با موفقیت ویرایش شد');
        router.push('/dashboard/missionOrder'); // Redirect after successful update
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ویرایش حکم ماموریت');
      }
    } catch (err) {
      console.error('Error updating mission order:', err);
      setError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="text-center py-10">در حال بارگیری اطلاعات ماموریت...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">خطا: {error}</div>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full sm:max-w-7xl">
      <LeafletConfig />
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">ویرایش حکم ماموریت</h1>
        
        <div className="mb-4 max-w-lg mx-auto">
          <SearchBox onSearchSelect={handleSearchSelect} />
        </div>

        <div className="w-full h-[400px] border rounded-lg mb-6 relative">
          <MapContainer
            center={mapCenter}
            key={mapCenter.toString()}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedUnit && (
              <Marker position={[selectedUnit.latitude, selectedUnit.longitude]} />
            )}
            {destinations.map((dest, index) => (
              <Marker key={index} position={[dest.lat, dest.lng]} />
            ))}
            {route && route.forward && <Polyline positions={route.forward} color="blue" weight={3} />}
            {route && route.return && <Polyline positions={route.return} color="red" weight={3} />}
            <MapEvents onLocationSelect={handleLocationSelect} />
          </MapContainer>
          {watch('totalDistance') && (
            <div className="absolute bottom-4 right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg text-sm sm:text-base">
              <span className="font-medium">مسافت کل: </span>
              <span className="text-blue-600">{watch('totalDistance') || '0'} کیلومتر</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">مقاصد انتخاب شده</h2>
          {destinations.length === 0 ? (
            <p className="text-gray-500">هنوز مقصدی انتخاب نشده است. روی نقشه کلیک کنید تا مقصد اضافه شود.</p>
          ) : (
            <div className="space-y-3">
              {destinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-medium">مقصد {index + 1}:</span>
                  <span className="flex-1">{dest.title}</span>
                  <span className="text-sm text-gray-500">
                    ({dest.lat.toFixed(4)}, {dest.lng.toFixed(4)})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDestination(index)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت رفت (کیلومتر)</label>
                <input type="text" value={watch('forwardDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت برگشت (کیلومتر)</label>
                <input type="text" value={watch('returnDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت کل (کیلومتر)</label>
                <input type="text" value={watch('totalDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت (ساعت)</label>
                <input type="text" value={watch('forwardTime') ? `${watch('forwardTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان برگشت (ساعت)</label>
                <input type="text" value={watch('returnTime') ? `${watch('returnTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان کل (ساعت)</label>
                <input type="text" value={watch('totalTime') ? `${watch('totalTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">مقاصد انتخاب شده</h2>
            {destinations.length === 0 ? (
              <p className="text-gray-500">هنوز مقصدی انتخاب نشده است. روی نقشه کلیک کنید تا مقصد اضافه شود.</p>
            ) : (
              <div className="space-y-3">
                {destinations.map((dest, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    <span className="font-medium">مقصد {index + 1}:</span>
                    <span className="flex-1">{dest.title}</span>
                    <span className="text-sm text-gray-500">
                      ({dest.lat.toFixed(4)}, {dest.lng.toFixed(4)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDestination(index)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ <span className="text-red-500">*</span></label>
              <div className="w-full relative">
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={watch('day')}
                  onChange={handleDateChange}
                  calendarPosition="bottom-right"
                  format="YYYY/MM/DD"
                  inputClass="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  containerClass="w-full"
                  required
                  plugins={[ /* Toolbar removed for brevity, assume it's similar */ ]}
                  calendarClass="bg-white border border-gray-300 rounded-lg shadow-lg"
                  headerClass="bg-gray-100 p-2 rounded-t-lg"
                  daysClass="text-gray-700"
                  selectedDayClass="bg-blue-500 text-white"
                  todayClass="bg-gray-100"
                  disabledClass="text-gray-400"
                  weekDaysClass="text-gray-600 font-medium"
                  weekDayClass="text-gray-600"
                  weekDays={['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']}
                  placeholder="تاریخ را انتخاب کنید"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">واحد مبدا <span className="text-red-500">*</span></label>
              <select
                value={selectedUnit?.id || ''}
                onChange={handleUnitChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                {unitLocations.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <input {...register('firstName')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <input {...register('lastName')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
              <input {...register('personnelNumber')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
              <input {...register('time')} type="time" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع ماموریت</label>
              <input {...register('missionSubject')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">همراهان</label>
              <input {...register('companions')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع وسیله نقلیه</label>
              <input {...register('transport')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وزن کل (کیلوگرم)</label>
              <input {...register('totalWeightKg')} type="number" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد شماره صورت جلسه</label>
              <input type="text" {...register('sessionCode')} className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">هزینه نهایی (تومان)</label>
              <input type="text" value={parseFloat(watch('finalCost') || '0').toLocaleString('fa-IR')} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base text-left"/>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات ماموریت</label>
            <textarea {...register('missionDescription')} rows="4" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"/>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MissionOrderEdit; 
