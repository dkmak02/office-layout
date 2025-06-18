import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Utility {
  id: string;
  utillNo: string;
  width: number;
  height: number;
  x_Axis: number;
  y_Axis: number;
  rotation: number;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useUtilsByFloor = (floor: string) => {
  return useQuery({
    queryKey: ["utils", "floor", floor],
    queryFn: async (): Promise<Utility[]> => {
      const response = await axios.get<Utility[]>(`${API_URL}/Utilities`, {
        withCredentials: true,
        params: { Floor: floor }
      });
      return response.data;
    },
    enabled: !!floor,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  });
};

