import { Employee } from "@/app/models/employeeModel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/employees`);
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
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
};
export default useEmployees;
