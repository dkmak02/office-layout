// hooks/useDesks.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Desk } from "@/models/Desk";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchDesks(floor: string, date: string): Promise<Desk[]> {
  const res = await axios.get(
    `${API_URL}/desks?floor=${floor}&pointInTime=${date}`,
    { withCredentials: true }
  );
  if (res.status !== 200) throw new Error("Error fetching desks");
  return res.data.desks.map((desk: Desk) => ({
    ...desk,
    opacity: desk.currentReservationID ? 1 : 0.6,
    baseOpacity: desk.currentReservationID ? 1 : 0.6,
  }));
}

export function useDesks(floor: string, date: string) {
  return useQuery({
    queryKey: ["desks", floor, date],
    queryFn: () => fetchDesks(floor, date),
  });
}
