"use client";

import { Eye } from "lucide-react";
import { SeriesListPage } from "@/components/profile";

export default function SeenPage() {
  return (
    <SeriesListPage
      status="seen"
      title="Seen"
      icon={Eye}
      iconColor="text-emerald-400"
      emptyTitle="No completed series yet"
      emptyDescription="Mark series as seen to keep track of what you've finished watching."
    />
  );
}
