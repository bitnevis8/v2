"use client";

import { use } from 'react'; // Import use from React
import RateSettingsEdit from '@/app/components/settings/RateSettings/RateSettingsEdit';

// Page components in App Router receive params prop by default
export default function EditRateSettingPage({ params: paramsPromise }) { // Rename prop to avoid conflict
  const params = use(paramsPromise); // Unwrap the params promise
  const id = params.id;

  // Handle cases where id might not be available yet
  if (!id) {
    return <div>در حال بارگذاری شناسه...</div>; // Or a more robust loading state
  }

  return (
    <div>
      {/* Pass the extracted id to the edit component */}
      <RateSettingsEdit id={id} />
    </div>
  );
} 