"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UserSearchResult } from "@/lib/validations/search";
import { CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserSearchItemProps {
  user: UserSearchResult;
  onSelect?: () => void;
}

export function UserSearchItem({ user, onSelect }: UserSearchItemProps) {
  const router = useRouter();

  const handleSelect = () => {
    onSelect?.();
    router.push(`/user/${user.id}`);
  };

  const avatarUrl = user.profileImage || user.image;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <CommandItem
      value={user.name}
      onSelect={handleSelect}
      className="flex items-center gap-3 px-3 py-2"
    >
      <Avatar className="h-8 w-8">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={user.name} />
        ) : null}
        <AvatarFallback>
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{user.name}</span>
    </CommandItem>
  );
}
