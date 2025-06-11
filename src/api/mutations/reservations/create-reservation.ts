import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateReservationParams {
  deskId: string;
  employeeId: number;
  startDate?: string;
  endDate?: string;
  isHotdesk: boolean;
  useCurrentUserEndpoint?: boolean;
  floor?: string;
  date?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createReservation = async ({ 
  deskId, 
  employeeId, 
  startDate, 
  endDate, 
  isHotdesk,
  useCurrentUserEndpoint = false,
  floor,
  date
}: CreateReservationParams) => {
  const config = { withCredentials: true };
  if (isHotdesk) {
    // Hotdesk reservation
    const endpoint = useCurrentUserEndpoint 
      ? `${API_URL}/Reservations/Hotdesk/CurrentUser`
      : `${API_URL}/Reservations/Hotdesk`;
      
    const response = await axios.post(
      endpoint,
      null,
      {
        ...config,
        params: {
          deskID: deskId,
          employeeID: employeeId,
          startTime: startDate,
          endTime: endDate,
        }
      }
    );
    console.log(response.data);
    return response.data;
  } else {
    // Project desk reservation
    const response = await axios.post(
      `${API_URL}/Reservations/Project`,
      null,
      {
        ...config,
        params: {
          deskID: deskId,
          employeeID: employeeId,
        }
      }
    );
    return response.data;
  }
};

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReservation,
    onSuccess: (data, variables) => {
      // Always invalidate user data as reservations affect user
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      // Invalidate desks query with proper date formatting
      if (variables.floor && variables.date) {
        // Convert the date to the formatted version used in the query
        const formattedDate = variables.date.includes('T') 
          ? variables.date 
          : `${variables.date}T00:00:00`;
          
        queryClient.invalidateQueries({ 
          queryKey: ["desks", variables.floor, formattedDate] 
        });
        
        // Also invalidate projects query for the same floor and date
        queryClient.invalidateQueries({ 
          queryKey: ["projects", variables.floor, formattedDate] 
        });
        
        // Invalidate unassigned employees query with formatted date
        queryClient.invalidateQueries({ queryKey: ["unassigned-employees", formattedDate] });
      } else {
        // Fallback to invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ["desks"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["unassigned-employees"] });
      }
      
      // Invalidate employees query as it may contain availability data
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
} 