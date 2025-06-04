import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SetEmployeeIgnoreAvailabilityParams {
  employeeId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const setEmployeeIgnoreAvailability = async ({ employeeId }: SetEmployeeIgnoreAvailabilityParams) => {
  console.log("employeeId", employeeId);
  const response = await axios.put(
    `${API_URL}/Employees/${employeeId}/IgnoreAvailability`,
    null,
    {
      withCredentials: true,
    }
  );
  if (response.status !== 200) {
    throw new Error("Failed to set employee ignore availability");
  }
  return response.data;
};

export function useSetEmployeeIgnoreAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setEmployeeIgnoreAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
} 