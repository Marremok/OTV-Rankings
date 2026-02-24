"use client";

import { Heart } from "lucide-react";
import { SeriesListPage } from "@/components/profile";

export default function FavoritesPage() {
  return (
    <SeriesListPage
      status="favorites"
      title="Favorites"
      icon={Heart}
      iconColor="text-rose-400"
      emptyTitle="No favorites yet"
      emptyDescription="Add your favorite series to quickly find them here."
    />
  );
}
