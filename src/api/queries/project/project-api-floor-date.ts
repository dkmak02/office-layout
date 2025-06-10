import { Project } from "@/models/Project";
import {
  useQuery,
  QueryKey,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getProjectsFloorDate = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Project[]> => {
  const selectedFloor = queryKey[1] as string;
  const date = queryKey[2] as string;
  try {
    const response = await axios.get(`${API_URL}/Projects`, {
      params: { floor: selectedFloor, pointInTime: date },
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching projects");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
const useProjects = (selectedFloor: string, selectedDate: string) => {
  const projectQuery = useQuery<Project[]>({
    queryKey: ["projects", selectedFloor, selectedDate],
    queryFn: getProjectsFloorDate,
  });

  return {
    ...projectQuery,
  };
};

const getProjectOptionValues = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(`${API_URL}/Availability`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching project option values");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching project option values:", error);
    throw error;
  }
};

export const useProjectOptionValues = () => {
  return useQuery({
    queryKey: ["project-option-values"],
    queryFn: getProjectOptionValues,
  });
};
  
export default useProjects;