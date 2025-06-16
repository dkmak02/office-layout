import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AssignDesksToProjectParams {
  floor: string;
  date: string;
  projectId: number;
  deskIds: number[];
}

const assignDesksToProject = async ({ projectId, deskIds, floor, date }: AssignDesksToProjectParams) => {
  const response = await axios.patch(
    `${API_URL}/Desks/Project`,
    deskIds,
    {
      params: {
        projectId: projectId === -1 ? null : projectId
      },
      withCredentials: true
    }
  );
  
  if (response.status !== 200) {
    throw new Error("Failed to assign desks to project");
  }
  return response.data;
  
};

export const useAssignDesksToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignDesksToProject,
    onSuccess: (data, variables) => {
      if (variables.floor && variables.date) {
        // Convert the date to the formatted version used in the query
        const formattedDate = variables.date.includes('T') 
          ? variables.date 
          : `${variables.date}T00:00:00`;
          
        queryClient.invalidateQueries({ 
          queryKey: ["desks", variables.floor, formattedDate] 
        });
        
        // Also invalidate projects query for the same floor and date
        queryClient.invalidateQueries({ 
          queryKey: ["projects", variables.floor, formattedDate] 
        });
      } else {
        // Fallback to invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ["desks"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
  });
}; 