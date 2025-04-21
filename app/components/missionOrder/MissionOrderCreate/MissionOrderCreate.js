"use client"

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import 'leaflet/dist/leaflet.css';
import { useMapEvents } from 'react-leaflet';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import jalaali from 'jalaali-js';
import { API_ENDPOINTS } from "@/app/config/api";
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

const ARYAFOULAD_COORDS = [31.348808655624506, 48.72288275224326]; // مختصات اریا فولاد

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

const MissionOrderCreate = () => {
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

  const [destinations, setDestinations] = useState([]);
  const [route, setRoute] = useState(null);
  const [unitLocations, setUnitLocations] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [defaultRate, setDefaultRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);

  // Load unit locations on component mount
  useEffect(() => {
    const fetchUnitLocations = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.unitLocations.getAll);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUnitLocations(data.data || []);
        // Set default unit
        const defaultUnit = data.data.find(unit => unit.isDefault);
        if (defaultUnit) {
          setSelectedUnit(defaultUnit);
          setValue('fromUnit', defaultUnit.name); // Set the fromUnit value
        }
      } catch (error) {
        console.error("Error fetching unit locations:", error);
      }
    };

    fetchUnitLocations();
  }, [setValue]);

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

  const calculateRoute = async (origin, destinations) => {
    if (rateLoading || defaultRate === null) {
        console.log("Default rate is still loading or not available.");
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
      
      // محاسبه هزینه نهایی با استفاده از نرخ پیش فرض
      const finalCost = calculateFinalCost(routeDetails.totalDistance, defaultRate);
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
    
    // Recalculate route with new origin
    if (destinations.length > 0) {
      await calculateRoute(unit, destinations);
    }
  };

  const handleLocationSelect = async (newDestination) => {
    console.log('Location selected:', newDestination);
    try {
      // Get location title from OpenStreetMap Nominatim API
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
      
      // Update coordinates display for the last destination
      setValue('missionCoordinates', `${newDestination.lat}, ${newDestination.lng}`);
      setValue('missionLocation', locationTitle);

      // Calculate new route with all destinations
      await calculateRoute(selectedUnit, updatedDestinations);
    } catch (error) {
      console.error('Error getting location details:', error);
    }
  };

  const removeDestination = async (index) => {
    const updatedDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(updatedDestinations);
    setValue('destinations', updatedDestinations);
    
    if (updatedDestinations.length > 0) {
      const lastDest = updatedDestinations[updatedDestinations.length - 1];
      setValue('missionCoordinates', `${lastDest.lat}, ${lastDest.lng}`);
      setValue('missionLocation', lastDest.title);
    } else {
      setValue('missionCoordinates', '');
      setValue('missionLocation', '');
      setRoute(null);
      setValue('distance', '0');
      setValue('roundTripDistance', '0');
      setValue('estimatedTime', '0');
      setValue('estimatedReturnTime', '0');
    }

    if (updatedDestinations.length > 0) {
      await calculateRoute(selectedUnit, updatedDestinations);
    }
  };

  const onSubmit = async (data) => {
    // Remove ratePerKm before submitting if it exists
    const submitData = { ...data };
    delete submitData.ratePerKm;

    try {
      const response = await fetch(API_ENDPOINTS.missionOrders.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitData), // Use submitData without ratePerKm
      });

      if (response.ok) {
        alert('حکم ماموریت با موفقیت ثبت شد');
        // Reset form
        Object.keys(data).forEach(key => setValue(key, ''));
        setDestinations([]);
        setRoute(null);
      } else {
        const errorData = await response.json();
        alert('خطا در ثبت حکم ماموریت: ' + (errorData.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('خطا در ثبت حکم ماموریت. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      try {
        const gregorianDate = jalaali.toGregorian(date.year, date.month, date.day);
        const formattedDate = `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, '0')}-${String(gregorianDate.gd).padStart(2, '0')}`;
        setValue('day', formattedDate);
      } catch (error) {
        console.error('Error converting date:', error);
        const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        setValue('day', formattedDate);
      }
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full sm:max-w-7xl">
      <LeafletConfig />
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">حکم ماموریت</h1>
        
        <div className="w-full h-[400px] border rounded-lg mb-6 relative">
          <MapContainer
            center={selectedUnit ? [selectedUnit.latitude, selectedUnit.longitude] : [31.348808655624506, 48.72288275224326]}
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
            <SearchBox onLocationSelect={handleLocationSelect} />
          </MapContainer>
          {watch('distance') && (
            <div className="absolute bottom-4 right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg text-sm sm:text-base">
              <span className="font-medium">فاصله: </span>
              <span className="text-blue-600">{watch('distance')} کیلومتر</span>
            </div>
          )}
        </div>

        {/* Destinations List */}
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
          {/* Read-only information box */}
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت رفت (کیلومتر)</label>
                <input
                  type="text"
                  value={watch('forwardDistance') || '0'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت برگشت (کیلومتر)</label>
                <input
                  type="text"
                  value={watch('returnDistance') || '0'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت کل (کیلومتر)</label>
                <input
                  type="text"
                  value={watch('totalDistance') || '0'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت (ساعت)</label>
                <input
                  type="text"
                  value={watch('forwardTime') ? `${watch('forwardTime')} ساعت` : '0 ساعت'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان برگشت (ساعت)</label>
                <input
                  type="text"
                  value={watch('returnTime') ? `${watch('returnTime')} ساعت` : '0 ساعت'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان کل (ساعت)</label>
                <input
                  type="text"
                  value={watch('totalTime') ? `${watch('totalTime')} ساعت` : '0 ساعت'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* First row - Date and Origin Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ <span className="text-red-500">*</span></label>
              <div className="w-full relative">
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={watch('day') ? new Date(watch('day')) : null}
                  onChange={handleDateChange}
                  calendarPosition="bottom-right"
                  format="YYYY/MM/DD"
                  inputClass="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  containerClass="w-full"
                  required
                  plugins={[
                    {
                      type: 'toolbar',
                      position: 'top',
                      options: {
                        today: 'امروز',
                        clear: 'پاک کردن',
                        save: 'ذخیره',
                      }
                    }
                  ]}
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

          {/* Other form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
              <input
                {...register('personnelNumber')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
              <input
                {...register('time')}
                type="time"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع ماموریت</label>
              <input
                {...register('missionSubject')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">همراهان</label>
              <input
                {...register('companions')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع وسیله نقلیه</label>
              <input
                {...register('transport')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وزن کل (کیلوگرم)</label>
              <input
                {...register('totalWeightKg')}
                type="number"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد شماره صورت جلسه</label>
              <input
                type="text"
                {...register('sessionCode')}
                className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">هزینه نهایی (تومان)</label>
              <input
                type="text"
                value={parseFloat(watch('finalCost') || '0').toLocaleString('fa-IR')}
                readOnly
                className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base text-left"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات ماموریت</label>
            <textarea
              {...register('missionDescription')}
              rows="4"
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm sm:text-base"
            >
              ثبت حکم ماموریت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MissionOrderCreateComponent = MissionOrderCreate;

const MissionOrderCreateDynamic = dynamic(() => Promise.resolve(MissionOrderCreateComponent), {
  ssr: false
});

export default MissionOrderCreateDynamic; 