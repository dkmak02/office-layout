import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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
  const config = { withCredentials: true };
  
  const response = await axios.post(
    `${API_URL}/Desks/ChangeDeskType`,
    {
      deskId,
      deskType,
    },
    config
  );
  
  if (response.status !== 200) {
    throw new Error("Failed to change desk type");
  }
  return response.data;
};

const changeProject = async ({ deskId, projectId, floor, date }: ChangeProjectParams) => {
  const config = { withCredentials: true };
  
  const response = await axios.post(
    `${API_URL}/Desks/ChangeProject`,
    {
      deskId,
      projectId,
    },
    config
  );
  
  if (response.status !== 200) {
    throw new Error("Failed to change project");
  }
  return response.data;
};

export function useChangeDeskType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeDeskType,
    onSuccess: (data, variables) => {
      // Invalidate desks query with specific floor and date if provided
      if (variables.floor && variables.date) {
        queryClient.invalidateQueries({ 
          queryKey: ["desks", variables.floor, variables.date] 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["desks"] });
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useChangeProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeProject,
    onSuccess: (data, variables) => {
      // Invalidate desks query with specific floor and date if provided
      if (variables.floor && variables.date) {
        queryClient.invalidateQueries({ 
          queryKey: ["desks", variables.floor, variables.date] 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["desks"] });
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
} 