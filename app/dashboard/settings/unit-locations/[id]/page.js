"use client";

import { use } from "react";
import UnitLocationDetails from "@/app/components/unitLocation/UnitLocationDetails/UnitLocationDetails";

export default function UnitLocationDetailsPage({ params }) {
  const { id } = use(params);
  return (
    <div className="p-6">
      <UnitLocationDetails id={id} />
    </div>
  );
}
