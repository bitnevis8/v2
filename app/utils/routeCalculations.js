/**
 * محاسبه مسافت و زمان مسیر
 * @param {Object} origin - نقطه مبدا {latitude, longitude}
 * @param {Array} destinations - آرایه مقاصد [{lat, lng}]
 * @returns {Promise<Object>} - نتیجه محاسبات شامل مسافت و زمان
 */
export async function calculateRouteDetails(origin, destinations) {
  try {
    if (!Array.isArray(destinations) || destinations.length === 0) {
      return {
        forwardDistance: 0,
        returnDistance: 0,
        totalDistance: 0,
        forwardTime: 0,
        returnTime: 0,
        totalTime: 0,
        forwardRoute: null,
        returnRoute: null
      };
    }

    // محاسبه مسیر رفت
    const waypoints = [
      [origin.longitude, origin.latitude],
      ...destinations.map(dest => [dest.lng, dest.lat])
    ];
    
    const waypointsStr = waypoints
      .map(point => `${point[0]},${point[1]}`)
      .join(';');
    
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching route: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.routes?.[0]) {
      throw new Error('No route found in response');
    }

    // محاسبه مسافت و زمان رفت
    const forwardRoute = data.routes[0].geometry.coordinates.map((coord) => [
      coord[1], // latitude
      coord[0]  // longitude
    ]);
    
    const forwardDistance = data.routes[0].distance / 1000; // تبدیل به کیلومتر
    const forwardTime = data.routes[0].duration / 3600; // تبدیل به ساعت

    // محاسبه مسیر برگشت
    const lastDestination = destinations[destinations.length - 1];
    const returnWaypointsStr = `${lastDestination.lng},${lastDestination.lat};${origin.longitude},${origin.latitude}`;
    
    const returnResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${returnWaypointsStr}?overview=full&geometries=geojson`
    );

    if (!returnResponse.ok) {
      throw new Error(`Error fetching return route: ${returnResponse.status}`);
    }

    const returnData = await returnResponse.json();
    
    if (!returnData.routes?.[0]) {
      throw new Error('No return route found in response');
    }

    // محاسبه مسافت و زمان برگشت
    const returnRoute = returnData.routes[0].geometry.coordinates.map((coord) => [
      coord[1], // latitude
      coord[0]  // longitude
    ]);

    const returnDistance = returnData.routes[0].distance / 1000; // تبدیل به کیلومتر
    const returnTime = returnData.routes[0].duration / 3600; // تبدیل به ساعت

    return {
      forwardDistance: Number(forwardDistance.toFixed(2)),
      returnDistance: Number(returnDistance.toFixed(2)),
      totalDistance: Number((forwardDistance + returnDistance).toFixed(2)),
      forwardTime: Number(forwardTime.toFixed(2)),
      returnTime: Number(returnTime.toFixed(2)),
      totalTime: Number((forwardTime + returnTime).toFixed(2)),
      forwardRoute,
      returnRoute
    };
  } catch (error) {
    console.error('Error in route calculations:', error);
    throw error;
  }
}

/**
 * محاسبه هزینه نهایی بر اساس مسافت و نرخ
 * @param {number} distance - مسافت کل (کیلومتر)
 * @param {number} ratePerKm - نرخ به ازای هر کیلومتر
 * @returns {number} - هزینه نهایی
 */
export function calculateFinalCost(distance, ratePerKm) {
  return Number((distance * ratePerKm).toFixed(2));
} 