import { Employee } from "@/models/Employee";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all employees (including assigned ones)
const getEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/Employees`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching employees data");
    }
    return response.data as Employee[];
  } catch (error) {
    console.error("Error fetching employees data:", error);
    throw error;
  }
};

// Get only unassigned employees for a specific date
const getUnassignedEmployees = async (date: string) => {
  try {
    const response = await axios.get(`${API_URL}/Employees/Unassigned`, {
      withCredentials: true,
      params: { pointInTime: date }
    });
    if (response.status !== 200) {
      throw new Error("Error fetching unassigned employees data");
    }
    return response.data as Employee[];
  } catch (error) {
    console.error("Error fetching unassigned employees data:", error);
    throw error;
  }
};

// Hook to get all employees (use this when you need to display names for assigned employees)
export const useEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
};

// Hook to get only unassigned employees for a specific date (use this for assignment dropdowns)
export const useUnassignedEmployees = (date: string) => {
  return useQuery<Employee[]>({
    queryKey: ["unassigned-employees", date],
    queryFn: () => getUnassignedEmployees(date),
    enabled: !!date,
  });
};

