"use client";

import { use } from "react";
import MissionOrderEdit from '@/app/components/missionOrder/MissionOrderEdit/MissionOrderEdit';

export default function MissionOrderEditPage({ params }) {
  const { id } = use(params);
  
  return (
    <div className="container mx-auto py-8">
      <MissionOrderEdit missionOrderId={id} />
    </div>
  );
} 