import { redirect } from 'next/navigation';
import MissionOrderDelete from '@/app/components/missionOrder/MissionOrderDelete/MissionOrderDelete';

export const metadata = {
  title: 'حذف حکم ماموریت | آریا فولاد',
  description: 'حذف حکم ماموریت در سیستم آریا فولاد',
};

export default async function MissionOrderDeletePage({ params }) {
  // استفاده از await برای دسترسی به پارامترهای مسیر
  const id = await params.id;
  
  const handleCancel = () => {
    redirect('/dashboard/missionOrder');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <MissionOrderDelete 
          missionOrderId={id}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 