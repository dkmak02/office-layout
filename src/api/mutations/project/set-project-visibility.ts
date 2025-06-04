import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SetProjectVisibilityParams {
  id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const setProjectVisibility = async ({ id}: SetProjectVisibilityParams) => {
    const response = await axios.patch(
        `${API_URL}/Projects/${id}/Visibility`,
        null,
        {
          withCredentials: true,
        }
      );
      
      
    if (response.status !== 200) {
      throw new Error("Failed to set project visibility");
    }
    return response.data;
  };
  

export function useSetProjectVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
        mutationFn: setProjectVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-info"] });
    },
  });
}
