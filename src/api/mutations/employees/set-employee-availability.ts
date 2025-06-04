import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SetEmployeeAvailabilityParams {
  employeeId: number;
  availability: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const setEmployeeAvailability = async ({ employeeId, availability }: SetEmployeeAvailabilityParams) => {
  const response = await axios.put(
    `${API_URL}/Employees/${employeeId}/Availability`,
    null,
    {
      withCredentials: true,
      params: { Availability: availability }
    }
  );
  if (response.status !== 200) {
    throw new Error("Failed to set employee availability");
  }
  return response.data;
};

export function useSetEmployeeAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setEmployeeAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
} 