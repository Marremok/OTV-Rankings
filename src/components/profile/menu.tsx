"use client";

import { List, Eye, Play, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ============================================
// TYPES
// ============================================

export interface SeriesStatusCounts {
  watchlist: number;
  seen: number;
  watching: number;
  favorites: number;
}

export interface ProfileMenuProps {
  counts: SeriesStatusCounts;
  isLoading?: boolean;
}

// ============================================
// MENU ITEM CONFIGURATION
// ============================================

const MENU_ITEMS = [
  {
    key: "watchlist" as const,
    icon: List,
    label: "Watchlist",
    href: "/profile/watchlist",
    color: "text-blue-400",
    description: "Series you plan to watch",
  },
  {
    key: "seen" as const,
    icon: Eye,
    label: "Seen",
    href: "/profile/seen",
    color: "text-emerald-400",
    description: "Series you've completed",
  },
  {
    key: "watching" as const,
    icon: Play,
    label: "Watching",
    href: "/profile/watching",
    color: "text-amber-400",
    description: "Series in progress",
  },
  {
    key: "favorites" as const,
    icon: Heart,
    label: "Favorites",
    href: "/profile/favorites",
    color: "text-rose-400",
    description: "Your favorite series",
  },
];

// ============================================
// COMPONENT: Profile Menu
// ============================================

export function ProfileMenu({ counts, isLoading = false }: ProfileMenuProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
            "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
            "hover:border-zinc-700/60 hover:bg-zinc-900/60"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center",
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <item.icon className={cn("w-5 h-5", item.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-zinc-300 group-hover:text-white transition-colors">
              {item.label}
            </p>
            {isLoading ? (
              <div className="h-4 w-8 bg-zinc-800/60 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-sm text-zinc-500">{counts[item.key]} series</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </Link>
      ))}
    </div>
  );
}

// ============================================
// COMPONENT: Compact Menu (alternative layout)
// ============================================

export interface CompactMenuProps {
  counts: SeriesStatusCounts;
  isLoading?: boolean;
}

export function CompactProfileMenu({ counts, isLoading = false }: CompactMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
            "border border-zinc-800/60 bg-zinc-900/40",
            "hover:border-zinc-700/60 hover:bg-zinc-900/60"
          )}
        >
          <item.icon className={cn("w-4 h-4", item.color)} />
          <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
            {item.label}
          </span>
          {isLoading ? (
            <span className="w-4 h-4 bg-zinc-800/60 rounded animate-pulse" />
          ) : (
            <span className="text-xs text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
              {counts[item.key]}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
