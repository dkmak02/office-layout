// hooks/useDesks.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Desk } from "@/models/Desk";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getDesksFloorDate(floor: string, date: string): Promise<Desk[]> {
  try {
  const res = await axios.get(
    `${API_URL}/Desks?Floor=${floor}&PointInTime=${date}`,
    { withCredentials: true }
  );
  if (res.status !== 200) throw new Error("Error fetching desks");
  return res.data.desks.map((desk: Desk) => ({
    ...desk,
    opacity: desk.currentReservationID ? 1 : 0.6,
    baseOpacity: desk.currentReservationID ? 1 : 0.6,
  }));
} catch (error) {
  console.error("Error fetching desks:", error);
  throw error;
}
}

export function useDesks(floor: string, date: string) {
  return useQuery({
    queryKey: ["desks", floor, date],
    queryFn: () => getDesksFloorDate(floor, date),
  });
}
