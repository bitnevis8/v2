import MissionOrderList from '@/app/components/missionOrder/MissionOrderList/MissionOrderList';

export const metadata = {
  title: 'احکام ماموریت | آریا فولاد',
  description: 'مدیریت احکام ماموریت آریا فولاد',
};

export default function MissionOrderListPage() {
  return (
    <div className="container mx-auto py-8">
      <MissionOrderList />
    </div>
  );
} 