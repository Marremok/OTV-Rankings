"use client";

import { List } from "lucide-react";
import { SeriesListPage } from "@/components/profile";

export default function WatchlistPage() {
  return (
    <SeriesListPage
      status="watchlist"
      title="Watchlist"
      icon={List}
      iconColor="text-blue-400"
      emptyTitle="Your watchlist is empty"
      emptyDescription="Start adding series you want to watch to keep track of them here."
    />
  );
}
