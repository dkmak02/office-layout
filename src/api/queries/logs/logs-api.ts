import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LogResponse } from "@/models/Log";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchLogs = async (pageNumber: number, pageSize: number): Promise<LogResponse[]> => {
  const config = { withCredentials: true };
  
  try {
    const response = await axios.get(
      `${API_URL}/Logs/${pageNumber}/${pageSize}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

export const useLogs = (pageNumber: number, pageSize: number) => {
  return useQuery({
    queryKey: ["logs", pageNumber, pageSize],
    queryFn: () => fetchLogs(pageNumber, pageSize),
    enabled: pageNumber > 0 && pageSize > 0,
  });
}; 