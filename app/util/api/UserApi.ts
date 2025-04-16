import { Employee } from "@/app/models/employeeModel";
import { User } from "@/app/models/userModel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/employee`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data as User;
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};

const useUser = () => {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
};
export default useUser;
