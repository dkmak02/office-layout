import { Employee, EmployeeInfo } from "@/models/Employee";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getEmployeesForSearching = async () => {
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

const useEmployees = () => {
  const searchBarEmployees = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: getEmployeesForSearching,
  });

  return {
    searchBarEmployees,
  };
};

const getEmployeesInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/UnassignedEmployees`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching employees info");
    }
    return response.data as EmployeeInfo[];
  } catch (error) {
    console.error("Error fetching employees info:", error);
    throw error;
  }
};

export const useEmployeesInfo = () => {
  return useQuery<EmployeeInfo[]>({
    queryKey: ["employees-info"],
    queryFn: getEmployeesInfo,
  });
};

export default useEmployees;
