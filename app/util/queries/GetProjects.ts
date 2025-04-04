import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@/app/models/projectModel";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`);
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data as Project[];
  } catch (error) {
    console.error("Error fetching floors data:", error);
    throw error;
  }
};

const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
};
export default useProjects;
