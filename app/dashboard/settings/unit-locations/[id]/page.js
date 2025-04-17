"use client";

import UnitLocationDetails from "@/app/components/unitLocation/UnitLocationDetails/UnitLocationDetails";

export default function UnitLocationDetailsPage({ params }) {
  return (
    <div className="p-6">
      <UnitLocationDetails id={params.id} />
    </div>
  );
}
