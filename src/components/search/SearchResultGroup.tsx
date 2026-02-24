"use client";

import { type LucideIcon } from "lucide-react";
import { CommandGroup } from "@/components/ui/command";

interface SearchResultGroupProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function SearchResultGroup({
  title,
  icon: Icon,
  children,
}: SearchResultGroupProps) {
  return (
    <CommandGroup
      heading={
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </span>
      }
    >
      {children}
    </CommandGroup>
  );
}
