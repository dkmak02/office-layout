import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchFloors = async () => {
  try {
    const response = await axios.get("/data/floors.json");
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data.floors;
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};

const useFloors = () => {
  return useQuery({
    queryKey: ["floors"],
    queryFn: fetchFloors,
  });
};
export default useFloors;
