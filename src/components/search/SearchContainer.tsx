"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useGlobalSearch } from "@/hooks/use-search";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import { cn } from "@/lib/utils";

interface SearchContainerProps {
  className?: string;
}

export function SearchContainer({ className }: SearchContainerProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isHoveringResultsRef = useRef(false);

  const debouncedQuery = useDebouncedValue(query, 300);
  const { data, isLoading, isFetching } = useGlobalSearch(debouncedQuery);

  // Open popover when user types
  useEffect(() => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  }, [query]);

  // Handle selecting a result
  const handleSelect = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }, []);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  }, [query]);

  // Handle input blur with delay to allow clicking results
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!isHoveringResultsRef.current) {
        setIsOpen(false);
      }
    }, 150);
  }, []);

  // Handle escape key to close popover
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={setQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search series, seasons, episodes, characters..."
            className="w-full xl:w-60"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-[min(400px,90vw)] p-0 shadow-lg"
        onMouseEnter={() => {
          isHoveringResultsRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveringResultsRef.current = false;
        }}
        onOpenAutoFocus={(e) => {
          // Prevent focus from moving to popover content
          e.preventDefault();
        }}
      >
        <SearchResults
          data={data?.results}
          isLoading={isLoading || isFetching}
          query={debouncedQuery}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
