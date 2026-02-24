"use client";

import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useUserImages } from "@/hooks/use-user-profile";

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

  // Fetch custom profile image from database
  const { data: userImages } = useUserImages(user?.id);

  // Prioritize custom profile image over OAuth provider image
  const displayImage = userImages?.profileImage || user?.image;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    <div
      className={appearance?.elements?.userButtonBox || "relative inline-block text-left"}
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          appearance?.elements?.userButtonTrigger ||
          `group relative flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700
          ${
            showName
              ? "gap-3 rounded-xl bg-neutral-100/50 hover:bg-neutral-100 py-1.5 pl-1.5 pr-3 border border-transparent hover:border-neutral-200 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 dark:hover:border-neutral-700"
              : "rounded-full hover:opacity-80 ring-2 ring-transparent hover:ring-neutral-200 dark:hover:ring-neutral-700"
          }`
        }
      >
        {/* Avatar */}
        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-neutral-200 bg-white shadow-sm transition-transform duration-200 group-active:scale-95 dark:border-neutral-700 dark:bg-neutral-800">
          {displayImage ? (
            <img
              src={displayImage}
              alt={user.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200 text-xs font-semibold text-neutral-600 dark:from-neutral-700 dark:to-neutral-800 dark:text-neutral-300">
              {initials}
            </div>
          )}
        </div>

        {/* Optional name display */}
        {showName && (
          <div className="flex flex-col text-left">
             <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-tight">
              {user.name || "User"}
            </span>
             <span className="text-[10px] text-neutral-500 font-medium leading-tight">
               View Profile
             </span>
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={
            appearance?.elements?.userButtonPopoverCard ||
            "absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/90 p-1 shadow-xl shadow-neutral-200/20 backdrop-blur-xl ring-1 ring-black/5 dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-200"
          }
        >
          {/* User info section */}
          <div className="px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="my-1 h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

          {/* Actions */}
          <div className={appearance?.elements?.userButtonPopoverActions || "space-y-0.5 p-1"}>
            <button
              onClick={handleManageAccount}
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <User className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white" />
              Profile Page
            </button>
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4 transition-colors" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}