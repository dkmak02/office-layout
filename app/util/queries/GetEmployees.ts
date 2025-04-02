import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchEmployees = async () => {
  try {
    const response = await axios.get("/data/employees.json");
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data.employees;
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};

const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
};
export default useEmployees;
