import { User } from "@/models/User";
import { Reservation } from "@/models/Reservation";
import { useTranslations } from "next-intl";

export interface ExtendedReservation extends Reservation {
  isHotdesk?: boolean;
}

export const canDeleteReservation = (
  reservation: Reservation,
  currentUser: User | undefined
): boolean => {
  if (!currentUser || !reservation) return false;

  // Admin can delete any reservation
  if (currentUser.isAdmin) return true;

  // Moderator can delete any reservation
  if (currentUser.isModerator) return true;

  // User can only delete their own reservations
  // Handle both string and number types for user IDs
  const currentUserIdStr = String(currentUser.id);
  const reservationUserIdStr = String(reservation.userId);
  if (reservationUserIdStr !== currentUserIdStr) return false;

  // For the user's own reservations, check if it's a hotdesk reservation
  // Hotdesk reservations have a valid endTime, permanent assignments have empty endTime
  const hasValidEndTime = Boolean(reservation.endTime && 
    reservation.endTime.trim() !== "" && 
    reservation.endTime !== "0001-01-01T00:00:00" && // Check for default/null dates
    !reservation.endTime.startsWith("0001-01-01"));

  return hasValidEndTime;
};

export const getDeleteButtonTooltip = (
  reservation: ExtendedReservation,
  currentUser: User | undefined
): string => {
  if (!currentUser) return "You must be logged in";
  
  if (canDeleteReservation(reservation, currentUser)) {
    return "Delete reservation";
  }
  
  if (reservation.userId !== currentUser.id) {
    return "You can only delete your own reservations";
  }
  
  if (reservation.userId === currentUser.id && !reservation.isHotdesk) {
    return "You can only delete hotdesk reservations";
  }
  
  return "You don't have permission to delete this reservation";
};

export const shouldUseHotdeskEndpoint = (
  reservation: ExtendedReservation,
  currentUser: User | undefined
): boolean => {
  if (!currentUser || !reservation) return false;
  // Admin and moderator can use general endpoint for a ny reservation
  if (currentUser.isAdmin || currentUser.isModerator) {
    return false;
  }

  // Regular employees must use hotdesk endpoint for their own hotdesk reservations
  if (reservation.isHotdesk) {
    return true;
  }

  // For any other case, they shouldn't be able to delete (but this is a fallback)
  return false;
}; 