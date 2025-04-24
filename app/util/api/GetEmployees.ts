import { Employee, UnassignedEmployee } from "@/app/models/employeeModel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/employees`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data as Employee[];
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};
const fetchUnassignedEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/UnassignedEmployees`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching unassigned employees data");
    }
    return response.data as UnassignedEmployee[];
  } catch (error) {
    console.error("Error fetching unassigned employees data:", error);
    throw error;
  }
};
const useEmployees = ({ isAdmin }: { isAdmin: boolean }) => {
  const allEmployees = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const unassignedEmployees = useQuery<UnassignedEmployee[]>({
    queryKey: ["unassignedEmployees"],
    queryFn: fetchUnassignedEmployees,
    enabled: isAdmin,
  });

  return {
    allEmployees,
    unassignedEmployees,
  };
};

export default useEmployees;
