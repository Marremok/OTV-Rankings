"use client"

import { getSeries, getTop10Series, getTop100Series } from "@/lib/actions/series"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


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