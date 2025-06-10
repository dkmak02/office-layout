import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "process";

interface ChangeDeskTypeParams {
  deskId: string;
  deskType: "Hotdesk" | "Project";
  floor?: string;
  date?: string;
}

interface ChangeProjectParams {
  deskId: string;
  projectId: number;
  floor?: string;
  date?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const changeDeskType = async ({ deskId, deskType, floor, date }: ChangeDeskTypeParams) => {
  
  const response = await axios.patch(
    `${API_URL}/Desks/${deskId}/Type`,
    null,
    {
      withCredentials: true,
      params: { type: deskType }
    }
  );
  
  if (response.status !== 200 && response.status !== 204) {
    throw new Error("Failed to change desk type");
  }
  return response.data;
};

const changeProject = async ({ deskId, projectId, floor, date }: ChangeProjectParams) => {
    
  const response = await axios.patch(
    `${API_URL}/Desks/${deskId}/Project`,
    null,
    {
      withCredentials: true,
      params: { projectID: projectId }
    }
  );
  if (response.status !== 200 && response.status !== 204) {
    throw new Error("Failed to change project");
  }
  return response.data;
};

export function useChangeDeskType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeDeskType,
    onSuccess: (data, variables) => {
      // Invalidate desks query with proper date formatting
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
      
      // Invalidate user and employees queries as desk changes may affect them
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useChangeProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeProject,
    onSuccess: (data, variables) => {
      // Invalidate desks query with proper date formatting
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
      
      // Invalidate user and employees queries as project changes may affect them
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
} 