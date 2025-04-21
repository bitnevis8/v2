"use client";

import { use } from "react";
import UnitLocationEdit from "@/app/components/unitLocation/UnitLocationEdit/UnitLocationEdit";

export default function EditUnitLocationPage({ params }) {
  const { id } = use(params);
  return (
    <div className="p-6">
      <UnitLocationEdit id={id} />
    </div>
  );
}
