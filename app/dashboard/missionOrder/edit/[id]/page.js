import MissionOrderEdit from '@/app/components/missionOrder/MissionOrderEdit/MissionOrderEdit';

export const metadata = {
  title: 'ویرایش حکم ماموریت | آریا فولاد',
  description: 'ویرایش حکم ماموریت در سیستم آریا فولاد',
};

export default async function MissionOrderEditPage({ params }) {
  // استفاده از await برای دسترسی به پارامترهای مسیر
  const id = await params.id;
  
  return (
    <div className="container mx-auto py-8">
      <MissionOrderEdit missionOrderId={id} />
    </div>
  );
} 