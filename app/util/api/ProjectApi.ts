import {
  useQuery,
  QueryKey,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@/app/models/projectModel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchProjects = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Project[]> => {
  const selectedFloor = queryKey[1] as string;

  try {
    const [projectsResponse, hotdesksResponse] = await Promise.all([
      axios.get<Project[]>(`${API_URL}/projects`),
      axios.get<Project>(`${API_URL}/desks/info`, {
        params: { floor: selectedFloor },
      }),
    ]);

    if (projectsResponse.status !== 200 || hotdesksResponse.status !== 200) {
      throw new Error("Error fetching project or desk data");
    }

    const combinedData = [...projectsResponse.data, hotdesksResponse.data];
    return combinedData;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

const changeProject = async ({
  deskId,
  projectId,
}: {
  deskId: number;
  projectId: number;
}) => {
  const response = await axios.patch(`${API_URL}/project`, {
    deskId,
    projectID: projectId, 
  });

  if (response.status !== 200) {
    throw new Error("Failed to update project");
  }

  return response.data;
};

const useProjects = (selectedFloor: string) => {
  const queryClient = useQueryClient();

  const projectQuery = useQuery<Project[]>({
    queryKey: ["projects", selectedFloor],
    queryFn: fetchProjects,
  });

  const projectMutation = useMutation({
    mutationFn: changeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", selectedFloor] });
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
    },
  });

  return {
    ...projectQuery,
    changeProject: projectMutation.mutate,
    changeProjectAsync: projectMutation.mutateAsync,
  };
};

export default useProjects;
