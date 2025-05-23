import { Employee } from "@/app/models/employeeModel";
import { User } from "@/app/models/userModel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const authUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/Auth`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};
const useAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: authUser,
  });
};
export default useAuth;
