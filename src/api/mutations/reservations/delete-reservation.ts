import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface DeleteReservationParams {
  reservationId: number;
  useHotdeskEndpoint?: boolean;
  date?: string;
  floor?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const deleteReservation = async ({ reservationId, useHotdeskEndpoint = false, date, floor }: DeleteReservationParams) => {
  const config = { withCredentials: true };
  try {
    if (useHotdeskEndpoint) {
      const response = await axios.delete(
        `${API_URL}/Reservations/Hotdesk/CurrentUser?reservationID=${reservationId}`,
        config
      );
      console.log("Employee delete response:", response.status);
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Failed to delete reservation. Status: ${response.status}`);
      }
      return response.data;
    } else {

      const response = await axios.delete(
        `${API_URL}/Reservations?reservationID=${reservationId}`,
        config
      );
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Failed to delete reservation. Status: ${response.status}`);
      }
      return response.data;
    }
  } catch (error) {
    console.error("Delete reservation error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      throw new Error(`Failed to delete reservation. Status: ${error.response?.status}`);
    }
    throw error;
  }
};

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReservation,
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
      } else {
        // Fallback to invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ["desks"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
      
      // Invalidate employees query as it may contain availability data
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
} 