"use client";

import { useRouter } from "next/navigation";
import UnitLocationList from "@/app/components/unitLocation/UnitLocationList/UnitLocationList";

export default function UnitLocationsPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت واحدها</h1>
        <button
          onClick={() => router.push("/dashboard/settings/unit-locations/create")}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          افزودن واحد جدید
        </button>
      </div>

      <UnitLocationList
        onView={(unit) => router.push(`/dashboard/settings/unit-locations/${unit.id}`)}
        onEdit={(unit) => router.push(`/dashboard/settings/unit-locations/edit/${unit.id}`)}
      />
    </div>
  );
}
