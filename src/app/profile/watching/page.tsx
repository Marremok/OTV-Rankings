"use client";

import { Play } from "lucide-react";
import { SeriesListPage } from "@/components/profile";

export default function WatchingPage() {
  return (
    <SeriesListPage
      status="watching"
      title="Currently Watching"
      icon={Play}
      iconColor="text-amber-400"
      emptyTitle="Not watching anything"
      emptyDescription="Mark series as currently watching to track your progress."
    />
  );
}
