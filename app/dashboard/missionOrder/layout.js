export default function MissionOrderLayout({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="py-0 sm:py-6">
        <div className="px-0 sm:px-4">
          {children}
        </div>
      </div>
    </div>
  );
} 