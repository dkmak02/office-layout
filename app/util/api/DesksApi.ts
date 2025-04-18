import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { Desk } from "@/app/models/deskModel";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchDesks = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<Desk[]> => {
  const selectedFloor = queryKey[1] as string;
  const date = queryKey[2] as string;
  const response = await axios.get(
    `${API_URL}/desks?floor=${selectedFloor}&pointInTime=${date}`,
    {
      withCredentials: true,
    }
  );
  if (response.status !== 200) {
    throw new Error("Error fetching desks");
  }
  return (response.data.desks as Desk[]).map((desk) => ({
    ...desk,
    opacity: 1,
  }));
};

const unreserveDesk = async (reservationId: number) => {
  const response = await axios.delete(`${API_URL}/reservations`, {
    data: { reservationID: reservationId },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });
  if (response.status !== 200) {
    throw new Error("Error unreserving desk");
  }
  return response.data;
};

const changePerson = async ({
  userId,
  deskId,
}: {
  userId: number;
  deskId: number;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/reservations`,
      {
        deskId,
        employeeId: userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing person:", error);
    throw error;
  }
};
const changeDeskType = async ({
  deskId,
  deskType,
}: {
  deskId: number;
  deskType: string;
}) => {
  try {
    const response = await axios.patch(
      `${API_URL}/desk/type`,
      {
        deskID: deskId,
        deskType: deskType,
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
      throw new Error("Error changing desk type");
    }
    return response.data;
  } catch (error) {
    console.error("Error changing desk type:", error);
    throw error;
  }
};
const hotdeskReservation = async ({
  deskId,
  employeeId,
  startDate,
  endDate,
}: {
  deskId: number;
  employeeId: number;
  startDate: any;
  endDate: any;
}) => {
  const response = await axios.post(
    `${API_URL}/hotdesk-reservations`,
    {
      deskId,
      employeeId,
      startDate,
      endDate,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    }
  );
  if (response.status === 409) {
    throw new Error(response.data.message);
  }
  if (response.status !== 201) {
    throw new Error("Error reserving hotdesk");
  }
  return response.data;
};
const hotdeskReservationCurrentUser = async ({
  deskId,
  employeeId,
  startDate,
  endDate,
}: {
  deskId: number;
  employeeId: number;
  startDate: any;
  endDate: any;
}) => {
  const response = await axios.post(
    `${API_URL}/current-user/hotdesk-reservations`,
    {
      deskId,
      employeeId,
      startDate,
      endDate,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    }
  );
  if (response.status === 409) {
    throw new Error(response.data.message);
  }
  if (response.status !== 201) {
    throw new Error("Error reserving hotdesk");
  }
  return response.data;
};
const unreserveDeskCurrentUser = async (reservationId: number) => {
  const response = await axios.delete(`${API_URL}/current-user/reservations`, {
    data: { reservationID: reservationId },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });
  if (response.status !== 200) {
    throw new Error("Error unreserving desk");
  }
  return response.data;
};
const useDesks = (selectedFloor: string, date: string) => {
  const queryClient = useQueryClient();

  const desksQuery = useQuery({
    queryKey: ["floors", selectedFloor, date],
    queryFn: fetchDesks,
  });

  const unreserveMutation = useMutation({
    mutationFn: unreserveDesk,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] }),
  });

  const personMutation = useMutation({
    mutationFn: changePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });
  const deskTypeMutation = useMutation({
    mutationFn: changeDeskType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] }),
  });
  const hotdeskMutation = useMutation({
    mutationFn: hotdeskReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });
  const hotdeskMutationCurrentUser = useMutation({
    mutationFn: hotdeskReservationCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });
  const unreserveMutationCurrentUser = useMutation({
    mutationFn: unreserveDeskCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors", selectedFloor] });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });
  return {
    ...desksQuery,
    unreserveDesk: unreserveMutation.mutate,
    unreserveDeskAsync: unreserveMutation.mutateAsync,
    isUnreserving: unreserveMutation.isPending,

    changePerson: personMutation.mutate,
    changePersonAsync: personMutation.mutateAsync,
    isChangingPerson: personMutation.isPending,

    changeDeskType: deskTypeMutation.mutate,
    changeDeskTypeAsync: deskTypeMutation.mutateAsync,
    isChangingDeskType: deskTypeMutation.isPending,

    hotdeskReservation: hotdeskMutation.mutate,
    hotdeskReservationAsync: hotdeskMutation.mutateAsync,
    isHotdesking: hotdeskMutation.isPending,

    unreserveDeskCurrentUser: unreserveMutationCurrentUser.mutate,
    unreserveDeskCurrentUserAsync: unreserveMutationCurrentUser.mutateAsync,
    isUnreservingCurrentUser: unreserveMutationCurrentUser.isPending,

    hotdeskReservationCurrentUser: hotdeskMutationCurrentUser.mutate,
    hotdeskReservationCurrentUserAsync: hotdeskMutationCurrentUser.mutateAsync,
    isHotdeskingCurrentUser: hotdeskMutationCurrentUser.isPending,
  };
};

export default useDesks;
