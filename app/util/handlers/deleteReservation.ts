import { message } from "antd";
import { useDataContext } from "../providers/AppDataContext";
import { Reservation } from "@/app/models/deskModel";
import { useQueryClient } from "@tanstack/react-query";
import useDesksMutations from "../api/DesksMutation";
export const useHandleDeleteReservation = () => {
  const queryClient = useQueryClient();
  const {
    setCurrentReservations,
    currentReservations,
    selectedFloor,
    selectedDate,
  } = useDataContext();
  const { unreserveDeskAsync, unreserveDeskCurrentUserAsync } =
    useDesksMutations(selectedFloor, selectedDate);

  const handleDeleteReservation = async (reservationId: number) => {
    try {
      await unreserveDeskAsync(reservationId);
      queryClient.invalidateQueries({
        queryKey: ["floors", selectedFloor],
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setCurrentReservations(
        currentReservations.filter(
          (reservation: Reservation) =>
            reservation.reservationID !== reservationId
        )
      );
    } catch (error) {
      console.error("Unreserve failed:", error);
      message.error("Failed to unreserve the desk.");
    }
  };
  const handleDeleteReservationCurrentUser = async (reservationId: number) => {
    try {
      await unreserveDeskCurrentUserAsync(reservationId);
      queryClient.invalidateQueries({
        queryKey: ["floors", selectedFloor],
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setCurrentReservations(
        currentReservations.filter(
          (reservation: Reservation) =>
            reservation.reservationID !== reservationId
        )
      );
    } catch (error) {
      console.error("Unreserve failed:", error);
      message.error("Failed to unreserve the desk.");
    }
  };

  return { handleDeleteReservation, handleDeleteReservationCurrentUser };
};
