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
      axios.get<Project[]>(`${API_URL}/projects`, {
        params: { floor: selectedFloor },
        withCredentials: true,
      }),
      axios.get<Project>(`${API_URL}/desks/info`, {
        params: { floor: selectedFloor, type: "Hotdesk" },
        withCredentials: true,
      }),
    ]);

    if (projectsResponse.status !== 200 || hotdesksResponse.status !== 200) {
      throw new Error("Error fetching project or desk data");
    }
    const hotdeskWithId = {
      ...hotdesksResponse.data,
      id: -170,
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

const changeProject = async ({
  deskId,
  projectId,
}: {
  deskId: number;
  projectId: number;
}) => {
  try {
    const response = await axios.patch(
      `${API_URL}/project`,
      {
        deskId,
        projectID: projectId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to update project");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project:", error);
    throw error;
  }
};

const changeProjectColor = async ({
  projectId,
  color,
}: {
  projectId: number;
  color: string;
}) => {
  try {
    const response = await axios.put(`${API_URL}/project/color`, null, {
      params: {
        ProjectID: projectId,
        HexColor: color,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error("Failed to update project color");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project color:", error);
    throw error;
  }
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
  const projectColorMutation = useMutation({
    mutationFn: changeProjectColor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", selectedFloor] });
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
    },
  });

  return {
    ...projectQuery,
    changeProject: projectMutation.mutate,
    changeProjectAsync: projectMutation.mutateAsync,

    changeProjectColor: projectColorMutation.mutate,
    changeProjectColorAsync: projectColorMutation.mutateAsync,
  };
};

export default useProjects;
