import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { Desk } from "@/app/models/deskModel";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchDesks = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Desk[]> => {
  const selectedFloor = queryKey[1] as string;
  const date = queryKey[2] as string;
  const response = await axios.get(
    `${API_URL}/desks?floor=${selectedFloor}&pointInTime=${date}`,
    {
      withCredentials: true,
    }
  );
  if (response.status !== 200) {
    throw new Error("Error fetching desks");
  }
  return (response.data.desks as Desk[]).map((desk) => ({
    ...desk,
    opacity: desk.currentReservationID ? 1 : 0.6,
    baseOpacity: desk.currentReservationID ? 1 : 0.6,
  }));
};


const useDesks = (selectedFloor: string, date: string) => {
  const desksQuery = useQuery({
    queryKey: ["floors", selectedFloor, date],
    queryFn: fetchDesks,
  });

  return {
    ...desksQuery,
  };
};

export default useDesks;
