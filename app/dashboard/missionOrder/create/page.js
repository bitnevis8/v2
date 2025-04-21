import MissionOrderCreate from '@/app/components/missionOrder/MissionOrderCreate/MissionOrderCreate';

export const metadata = {
  title: 'ایجاد حکم ماموریت جدید | آریا فولاد',
  description: 'ایجاد حکم ماموریت جدید در سیستم آریا فولاد',
};

export default function MissionOrderCreatePage() {
  return (
    <div className="container mx-auto py-8">
      <MissionOrderCreate />
    </div>
  );
} 