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
const fetchAllProjects = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Project[]> => {
  const selectedFloor = queryKey[1] as string;
  const date = queryKey[2] as string;
  try {
    const [projectsResponse, hotdesksResponse] = await Promise.all([
      axios.get<Project[]>(`${API_URL}/getAllProjects`, {
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
const changeProjectVisibility = async ({
  projectId,
  visibility,
}: {
  projectId: number;
  visibility: boolean;
}) => {
  try {
    const response = await axios.patch(`${API_URL}/project/visibility`, null, {
      params: {
        ProjectID: projectId,
        Visibility: visibility,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error("Failed to update project visibility");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project visibility:", error);
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
const changeProjectTypeColor = async ({
  projectType,
  color,
}: {
  projectType: string;
  color: string;
}) => {
  try {
    const response = await axios.put(`${API_URL}/desk/type/color`, null, {
      params: {
        type: projectType,
        HexColor: color,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error("Failed to update project type color");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project type color:", error);
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
const syncProject = async () => {
  try {
    const response = await axios.patch(
      `${API_URL}/SyncUnactiveProjects`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to sync project");
    }

    return response.data;
  } catch (error) {
    console.error("Error changing project:", error);
    throw error;
  }
};
const useProjects = (selectedFloor: string, selectedDate: string) => {
  const queryClient = useQueryClient();
  const projectQuery = useQuery<Project[]>({
    queryKey: ["projects", selectedFloor, selectedDate],
    queryFn: fetchProjects,
  });
  const allProjectQuery = useQuery<Project[]>({
    queryKey: ["projects", selectedFloor, selectedDate, "all"],
    queryFn: fetchAllProjects,
  });
  const changeProjectVisibilityMutation = useMutation({
    mutationFn: changeProjectVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["floors"] });
    },
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
  const projectTypeColorMutation = useMutation({
    mutationFn: changeProjectTypeColor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", selectedFloor] });
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
    },
  });
  const syncProjectMutation = useMutation({
    mutationFn: syncProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", selectedFloor] });
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
    },
  });

  return {
    ...projectQuery,

    allProjects: allProjectQuery.data,
    changeProject: projectMutation.mutate,
    changeProjectAsync: projectMutation.mutateAsync,

    changeProjectColor: projectColorMutation.mutate,
    changeProjectColorAsync: projectColorMutation.mutateAsync,

    changeProjectTypeColor: projectTypeColorMutation.mutate,
    changeProjectTypeColorAsync: projectTypeColorMutation.mutateAsync,

    syncProject: syncProjectMutation.mutate,
    syncProjectAsync: syncProjectMutation.mutateAsync,

    changeProjectVisibility: changeProjectVisibilityMutation.mutate,
    changeProjectVisibilityAsync: changeProjectVisibilityMutation.mutateAsync,
  };
};

export default useProjects;
