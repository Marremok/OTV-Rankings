"use client"

import { getSeries, getTop10Series, getTop100Series } from "@/lib/actions/series"
import { getTopCharacters } from "@/lib/actions/characters"
import { useQuery } from "@tanstack/react-query";


export function useGetSeries() {
  const result = useQuery({
    queryKey: ["getSeries"],
    queryFn: getSeries,
  });

  return result;
};

export function useGetTop10Series() {
  const result = useQuery({
    queryKey: ["getTop10Series"],
    queryFn: getTop10Series,
  });

  return result;
};

export function useGetTop100Series() {
  const result = useQuery({
    queryKey: ["getTop100Series"],
    queryFn: getTop100Series,
  });

  return result;
};

export function useGetTop10Characters() {
  return useQuery({
    queryKey: ["getTop10Characters"],
    queryFn: () => getTopCharacters(10),
  });
};

export function useGetTop100Characters() {
  return useQuery({
    queryKey: ["getTop100Characters"],
    queryFn: () => getTopCharacters(100),
  });
};