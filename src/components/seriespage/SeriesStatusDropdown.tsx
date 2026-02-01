"use client";

import { useState, useRef, useEffect } from "react";
import { List, Eye, Play, Heart, ChevronDown, Check, Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useSeriesStatus, useUpdateSeriesStatus } from "@/hooks/use-user-profile";

// ============================================
// TYPES
// ============================================

interface SeriesStatusDropdownProps {
  seriesId: string;
  className?: string;
}

type StatusKey = "isWatchlist" | "isSeen" | "isWatching" | "isFavorite";

interface StatusOption {
  key: StatusKey;
  label: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
  description: string;
}

// ============================================
// STATUS OPTIONS CONFIGURATION
// ============================================

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "isWatching",
    label: "Currently Watching",
    icon: Play,
    color: "text-amber-400",
    activeColor: "bg-amber-400/10 border-amber-400/30",
    description: "You're actively watching this series",
  },
  {
    key: "isSeen",
    label: "Seen",
    icon: Eye,
    color: "text-emerald-400",
    activeColor: "bg-emerald-400/10 border-emerald-400/30",
    description: "You've finished watching this series",
  },
  {
    key: "isWatchlist",
    label: "Watchlist",
    icon: List,
    color: "text-blue-400",
    activeColor: "bg-blue-400/10 border-blue-400/30",
    description: "Add to your watchlist for later",
  },
  {
    key: "isFavorite",
    label: "Favorite",
    icon: Heart,
    color: "text-rose-400",
    activeColor: "bg-rose-400/10 border-rose-400/30",
    description: "Mark as one of your favorites",
  },
];

// ============================================
// COMPONENT: Series Status Dropdown
// ============================================

export function SeriesStatusDropdown({ seriesId, className }: SeriesStatusDropdownProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current status
  const { data: currentStatus, isLoading: isStatusLoading } = useSeriesStatus(user?.id, seriesId);

  // Update status mutation
  const updateStatus = useUpdateSeriesStatus();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle status toggle
  const handleStatusToggle = (statusKey: StatusKey) => {
    if (!user?.id) return;

    const newValue = !currentStatus?.[statusKey];

    updateStatus.mutate({
      userId: user.id,
      seriesId,
      status: { [statusKey]: newValue },
    });
  };

  // Get active statuses for display
  const activeStatuses = STATUS_OPTIONS.filter(
    (option) => currentStatus?.[option.key]
  );

  // Determine button display
  const getButtonContent = () => {
    if (!user) {
      return {
        icon: LogIn,
        label: "Sign in to track",
        color: "text-zinc-400",
      };
    }

    if (isStatusLoading) {
      return {
        icon: Loader2,
        label: "Loading...",
        color: "text-zinc-400",
        spin: true,
      };
    }

    if (activeStatuses.length === 0) {
      return {
        icon: List,
        label: "Add to list",
        color: "text-zinc-300",
      };
    }

    if (activeStatuses.length === 1) {
      return {
        icon: activeStatuses[0].icon,
        label: activeStatuses[0].label,
        color: activeStatuses[0].color,
      };
    }

    // Multiple statuses active
    return {
      icon: Check,
      label: `${activeStatuses.length} lists`,
      color: "text-primary",
    };
  };

  const buttonContent = getButtonContent();
  const ButtonIcon = buttonContent.icon;

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => user && setIsOpen(!isOpen)}
        disabled={!user}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
          "bg-black/40 backdrop-blur-md border",
          user
            ? "border-white/10 hover:bg-black/60 hover:border-white/20 hover:scale-105"
            : "border-white/5 cursor-not-allowed opacity-70",
          isOpen && "bg-black/60 border-white/20"
        )}
      >
        <ButtonIcon
          className={cn(
            "w-4 h-4 transition-all",
            buttonContent.color,
            buttonContent.spin && "animate-spin"
          )}
        />
        <span className={cn("text-sm font-medium", buttonContent.color)}>
          {buttonContent.label}
        </span>
        {user && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-zinc-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && user && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-64 z-50",
            "rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl",
            "shadow-2xl shadow-black/50",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-semibold text-zinc-200">Add to your lists</p>
            <p className="text-xs text-zinc-500 mt-0.5">Select one or more options</p>
          </div>

          {/* Options */}
          <div className="p-2">
            {STATUS_OPTIONS.map((option) => {
              const isActive = currentStatus?.[option.key];
              const Icon = option.icon;
              const isUpdating = updateStatus.isPending;

              return (
                <button
                  key={option.key}
                  onClick={() => handleStatusToggle(option.key)}
                  disabled={isUpdating}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-zinc-800/50",
                    isActive && option.activeColor,
                    isUpdating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isActive ? "bg-white/10" : "bg-zinc-800"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? option.color : "text-zinc-400")} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-white" : "text-zinc-300"
                      )}
                    >
                      {option.label}
                    </p>
                  </div>

                  {/* Check indicator */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isActive
                        ? `${option.color} border-current`
                        : "border-zinc-600"
                    )}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/50">
            <p className="text-xs text-zinc-500 text-center">
              Changes are saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
