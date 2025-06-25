import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LogData } from "@/models/Log";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchLogs = async (pageNumber: number, pageSize: number, month: string): Promise<LogData> => {
  const config = { withCredentials: true, params: { date: month } };
  
  try {
    let url = `${API_URL}/Logs/${pageNumber}/${pageSize}`;
    
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

export const useLogs = (pageNumber: number, pageSize: number, month: string) => {
  return useQuery({
    queryKey: ["logs", pageNumber, pageSize, month],
    queryFn: () => fetchLogs(pageNumber, pageSize, month),
    enabled: pageNumber > 0 && pageSize > 0,
  });
}; 