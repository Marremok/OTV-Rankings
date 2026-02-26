"use client";

import { Loader2, Film, User, Users, Layers, Tv } from "lucide-react";
import { Command, CommandList, CommandEmpty } from "@/components/ui/command";
import type { GroupedSearchResults } from "@/lib/validations/search";
import { SearchResultGroup } from "./SearchResultGroup";
import { SeriesSearchItem } from "./SeriesSearchItem";
import { CharacterSearchItem } from "./CharacterSearchItem";
import { UserSearchItem } from "./UserSearchItem";
import { SeasonSearchItem } from "./SeasonSearchItem";
import { EpisodeSearchItem } from "./EpisodeSearchItem";

interface SearchResultsProps {
  data: GroupedSearchResults | undefined;
  isLoading: boolean;
  query: string;
  onSelect: () => void;
}

export function SearchResults({ data, isLoading, query, onSelect }: SearchResultsProps) {
  const hasResults = data && (
    data.series.length > 0 ||
    data.characters.length > 0 ||
    data.users.length > 0 ||
    data.seasons.length > 0 ||
    data.episodes.length > 0
  );
  const showEmpty = query.length > 0 && !isLoading && !hasResults;

  return (
    <Command className="border-none shadow-none">
      <CommandList className="max-h-[420px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {showEmpty && (
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </CommandEmpty>
        )}

        {!isLoading && hasResults && (
          <>
            {data.series.length > 0 && (
              <SearchResultGroup title="Series" icon={Film}>
                {data.series.map((series) => (
                  <SeriesSearchItem key={series.id} series={series} onSelect={onSelect} />
                ))}
              </SearchResultGroup>
            )}

            {data.characters.length > 0 && (
              <SearchResultGroup title="Characters" icon={User}>
                {data.characters.map((character) => (
                  <CharacterSearchItem key={character.id} character={character} onSelect={onSelect} />
                ))}
              </SearchResultGroup>
            )}

            {data.seasons.length > 0 && (
              <SearchResultGroup title="Seasons" icon={Layers}>
                {data.seasons.map((season) => (
                  <SeasonSearchItem key={season.id} season={season} onSelect={onSelect} />
                ))}
              </SearchResultGroup>
            )}

            {data.episodes.length > 0 && (
              <SearchResultGroup title="Episodes" icon={Tv}>
                {data.episodes.map((episode) => (
                  <EpisodeSearchItem key={episode.id} episode={episode} onSelect={onSelect} />
                ))}
              </SearchResultGroup>
            )}

            {data.users.length > 0 && (
              <SearchResultGroup title="Users" icon={Users}>
                {data.users.map((user) => (
                  <UserSearchItem key={user.id} user={user} onSelect={onSelect} />
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
