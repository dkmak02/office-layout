import { useQuery, QueryKey } from "@tanstack/react-query";
import { Desk } from "@/app/models/deskModel";
import axios from "axios";

const fetchDesks = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Desk[]> => {
  const selectedFloor = queryKey[1] as string;
  try {
    const response = await axios.get("/data/desks.json");
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    console.log("Desks data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};

const useDesks = (selectedFloor:string) => {
  return useQuery<Desk[],Error>({
    queryKey: ["floors", selectedFloor],
    queryFn: fetchDesks,
  });
};
export default useDesks;
