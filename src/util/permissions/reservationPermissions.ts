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
  if (reservation.userId !== currentUser.id) return false;

  // For the user's own reservations, allow deletion if:
  // 1. It's a hotdesk reservation (has an endTime that's not empty/null)
  // 2. Or if we're in the context where the user is viewing their own reservations
  if (reservation.endTime && reservation.endTime.trim() !== "") {
    return true; // This is likely a hotdesk reservation with a time limit
  }

  return false;
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

  // Admin and moderator can use general endpoint for any reservation
  if (currentUser.isAdmin || currentUser.isModerator) {
    return false;
  }

  // Regular employees must use hotdesk endpoint for their own hotdesk reservations
  if (reservation.userId === currentUser.id && reservation.isHotdesk) {
    return true;
  }

  // For any other case, they shouldn't be able to delete (but this is a fallback)
  return false;
}; 