import MissionOrderDetails from '@/app/components/missionOrder/MissionOrderDetails/MissionOrderDetails';

export const metadata = {
  title: 'جزئیات حکم ماموریت | آریا فولاد',
  description: 'مشاهده جزئیات حکم ماموریت در سیستم آریا فولاد',
};

export default async function MissionOrderDetailsPage({ params }) {
  // استفاده از await برای دسترسی به پارامترهای مسیر
  const id = await params.id;
  
  return (
    <div className="container mx-auto py-8">
      <MissionOrderDetails missionOrderId={id} />
    </div>
  );
}