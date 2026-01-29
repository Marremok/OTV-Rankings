"use client";

import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserButtonProps {
  showName?: boolean;
  afterSignOutUrl?: string;
  userProfileUrl?: string;
  appearance?: {
    elements?: {
      userButtonBox?: string;
      userButtonTrigger?: string;
      userButtonPopoverCard?: string;
      userButtonPopoverActions?: string;
    };
  };
}

export function UserButton({
  showName = false,
  afterSignOutUrl = "/",
  userProfileUrl = "/profile",
  appearance,
}: UserButtonProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push(afterSignOutUrl);
    setIsOpen(false);
  };

  const handleManageAccount = () => {
    router.push(userProfileUrl);
    setIsOpen(false);
  };

  if (!user) return null;

  // Get initials for avatar fallback
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user.email[0].toUpperCase();

  return (
    <div className={appearance?.elements?.userButtonBox || "relative"} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={appearance?.elements?.userButtonTrigger || "flex items-center gap-2"}
      >
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Optional name display */}
        {showName && (
          <span className="text-sm font-medium">{user.name || user.email}</span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={
            appearance?.elements?.userButtonPopoverCard ||
            "absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50"
          }
        >
          {/* User info section */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-medium overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={appearance?.elements?.userButtonPopoverActions || "py-2"}>
            <button
              onClick={handleManageAccount}
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Manage account
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}