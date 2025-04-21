// بررسی محیط اجرا
const isDevelopment = process.env.NODE_ENV === 'development';
console.log('Current environment:', process.env.NODE_ENV); // برای دیباگ

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://api.parandx.com';

export const API_ENDPOINTS = {
  unitLocations: {
    base: `${API_BASE_URL}/aryafoulad/unit-locations`,
    getAll: `${API_BASE_URL}/aryafoulad/unit-locations`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/${id}`,
    create: `${API_BASE_URL}/aryafoulad/unit-locations/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/delete/${id}`,
    default: `${API_BASE_URL}/aryafoulad/unit-locations/default`,
  },
  missionOrders: {
    base: `${API_BASE_URL}/aryafoulad/mission-orders`,
    getAll: `${API_BASE_URL}/aryafoulad/mission-orders/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/mission-orders/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/mission-orders/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/mission-orders/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/mission-orders/delete/${id}`,
  },
  rateSettings: {
    base: `${API_BASE_URL}/aryafoulad/rate-settings`,
    getAll: `${API_BASE_URL}/aryafoulad/rate-settings/getAll`,
    getActive: `${API_BASE_URL}/aryafoulad/rate-settings/getActive`,
    create: `${API_BASE_URL}/aryafoulad/rate-settings/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/rate-settings/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/rate-settings/delete/${id}`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/rate-settings/${id}`,
  },
}; 