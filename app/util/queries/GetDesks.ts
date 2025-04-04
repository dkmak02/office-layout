import { useQuery, QueryKey } from "@tanstack/react-query";
import { Desk } from "@/app/models/deskModel";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchDesks = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Desk[]> => {
  const selectedFloor = queryKey[1] as string;
  try {
    const response = await axios.get(`${API_URL}/desks?floor=${selectedFloor}`);
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data.desks as Desk[];
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};

const useDesks = (selectedFloor: string) => {
  return useQuery({
    queryKey: ["floors", selectedFloor],
    queryFn: fetchDesks,
  });
};
export default useDesks;
