import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const syncProjects = async () => {
  const response = await axios.delete(
    `${API_URL}/Projects/Sync`,
    {
      withCredentials: true,
    }
  );
  
  if (response.status !== 200 && response.status !== 204) {
    throw new Error("Failed to sync projects");
  }
  return response.data;
};

export function useSyncProjects(floor?: string, date?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncProjects,
    onSuccess: () => {
      // Invalidate all project-related queries to refresh data
      if (floor && date) {
        queryClient.invalidateQueries({ queryKey: ["projects", floor, date] });
        queryClient.invalidateQueries({ queryKey: ["desks", floor, date] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["desks"] });
      }
      queryClient.invalidateQueries({ queryKey: ["project-info"] });
    },
  });
} 