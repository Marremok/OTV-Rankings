"use client";

import { Loader2, Film, Users } from "lucide-react";
import { Command, CommandList, CommandEmpty } from "@/components/ui/command";
import type { GroupedSearchResults } from "@/lib/validations/search";
import { SearchResultGroup } from "./SearchResultGroup";
import { SeriesSearchItem } from "./SeriesSearchItem";
import { UserSearchItem } from "./UserSearchItem";

interface SearchResultsProps {
  data: GroupedSearchResults | undefined;
  isLoading: boolean;
  query: string;
  onSelect: () => void;
}

export function SearchResults({
  data,
  isLoading,
  query,
  onSelect,
}: SearchResultsProps) {
  const hasResults =
    data && (data.series.length > 0 || data.users.length > 0);
  const showEmpty = query.length > 0 && !isLoading && !hasResults;

  return (
    <Command className="border-none shadow-none">
      <CommandList className="max-h-[300px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {showEmpty && (
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No results found for "{query}"
          </CommandEmpty>
        )}

        {!isLoading && hasResults && (
          <>
            {data.series.length > 0 && (
              <SearchResultGroup title="Series" icon={Film}>
                {data.series.map((series) => (
                  <SeriesSearchItem
                    key={series.id}
                    series={series}
                    onSelect={onSelect}
                  />
                ))}
              </SearchResultGroup>
            )}

            {data.users.length > 0 && (
              <SearchResultGroup title="Users" icon={Users}>
                {data.users.map((user) => (
                  <UserSearchItem
                    key={user.id}
                    user={user}
                    onSelect={onSelect}
                  />
                ))}
              </SearchResultGroup>
            )}
          </>
        )}

        {!query && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Start typing to search...
          </div>
        )}
      </CommandList>
    </Command>
  );
}
