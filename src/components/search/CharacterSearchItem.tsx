"use client";

import { User, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CharacterSearchResult } from "@/lib/validations/search";
import { CommandItem } from "@/components/ui/command";

interface CharacterSearchItemProps {
  character: CharacterSearchResult;
  onSelect?: () => void;
}

export function CharacterSearchItem({ character, onSelect }: CharacterSearchItemProps) {
  const router = useRouter();

  const handleSelect = () => {
    onSelect?.();
    if (character.slug) {
      router.push(`/characters/${character.slug}`);
    }
  };

  return (
    <CommandItem
      value={character.name}
      onSelect={handleSelect}
      className="flex items-center gap-3 px-3 py-2"
    >
      {character.posterUrl ? (
        <img
          src={character.posterUrl}
          alt={character.name}
          className="h-10 w-7 rounded object-cover shrink-0"
        />
      ) : (
        <div className="flex h-10 w-7 items-center justify-center rounded bg-muted shrink-0">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="font-medium truncate">{character.name}</span>
        {character.seriesTitle && (
          <span className="text-xs text-muted-foreground truncate">{character.seriesTitle}</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-sm shrink-0">
        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
        <span>{character.score.toFixed(1)}</span>
      </div>
    </CommandItem>
  );
}
