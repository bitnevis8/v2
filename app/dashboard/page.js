export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">داشبورد</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2"> راهنما</h3>
          <p className="text-gray-600">از منوی سایدبار انتخاب کنید</p>
        </div>
        {/* Add more dashboard cards here */}
      </div>
    </div>
  );
} 