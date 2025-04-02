import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchProjects = async () => {
  try {
    const response = await axios.get("/data/projects.json");
    if (response.status !== 200) {
      throw new Error("Error fetching floors data");
    }
    return response.data.projects;
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
