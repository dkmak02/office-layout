import { UnassignedEmployee } from "@/app/models/employeeModel";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const handleUpdateEmployeeRemoteWork = async ({
  employeeID,
  availability,
}: {
  employeeID: number;
  availability: string;
}) => {
  try {
    const response = await axios.put(`${API_URL}/SetUserAvailability`, null, {
      params: {
        employeeID,
        availability,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error("Failed to update project visibility");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project visibility:", error);
    throw error;
  }
};
const handleUpdateEmployeeIgnoreAvability = async ({
  employeeID,
}: {
  employeeID: number;
}) => {
  try {
    const response = await axios.put(`${API_URL}/IgnoreAvailability`, null, {
      params: {
        employeeID,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error("Failed to update project visibility");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project visibility:", error);
    throw error;
  }
};
const useEmployeesMutaion = () => {
  const queryClient = useQueryClient();
  const changeRemoteWorkMutation = useMutation({
    mutationFn: handleUpdateEmployeeRemoteWork,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unassignedEmployees"],
      });
    },
  });
  const changeIgnoreAvailabilityMutation = useMutation({
    mutationFn: handleUpdateEmployeeIgnoreAvability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unassignedEmployees"],
      });
    },
  });
  return {
    changeRemoteWorkMutation: changeRemoteWorkMutation.mutateAsync,
    isLoading: changeRemoteWorkMutation.isPending,
    changeIgnoreAvailabilityMutation:
      changeIgnoreAvailabilityMutation.mutateAsync,
  };
};

export default useEmployeesMutaion;
  