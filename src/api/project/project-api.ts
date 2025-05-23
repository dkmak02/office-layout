import { Project } from "@/models/Project";
import {
  useQuery,
  QueryKey,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetchProjects = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Project[]> => {
  const selectedFloor = queryKey[1] as string;
  const date = queryKey[2] as string;
  try {
    const [projectsResponse, hotdesksResponse] = await Promise.all([
      axios.get<Project[]>(`${API_URL}/projects`, {
        params: { floor: selectedFloor },
        withCredentials: true,
      }),
      axios.get<Project>(`${API_URL}/desks/info`, {
        params: { floor: selectedFloor, type: "Hotdesk", pointInTime: date },
        withCredentials: true,
      }),
    ]);

    if (projectsResponse.status !== 200 || hotdesksResponse.status !== 200) {
      throw new Error("Error fetching project or desk data");
    }
    const hotdeskWithId = {
      ...hotdesksResponse.data,
      id: -170,
      visibility: true,
    };
    const combinedData = [hotdeskWithId, ...projectsResponse.data];
    const projectIdToMove = 1000005;
    const projectIndex = combinedData.findIndex(
      (project) => project.id === projectIdToMove
    );
    if (projectIndex !== -1) {
      const [projectToMove] = combinedData.splice(projectIndex, 1);
      combinedData.push(projectToMove);
    }
    return combinedData;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
const useProjects = (selectedFloor: string, selectedDate: string) => {
  const queryClient = useQueryClient();
  const projectQuery = useQuery<Project[]>({
    queryKey: ["projects", selectedFloor, selectedDate],
    queryFn: fetchProjects,
  });

  return {
    ...projectQuery,
  };
};

export default useProjects;