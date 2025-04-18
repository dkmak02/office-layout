export interface Reservation {
  reservationID: number;
  startTime: string;
  endTime: string;
  userId: number;
  userName?: string;
  deskNo?: string;
}
export interface Desk {
  name: string;
  deskId: number;
  project: {
    projectName: string;
    code: string;
  };
  hotdesk: boolean;
  reservations: Reservation[];
  currentReservationID: number | null;
  color: string;
  width: string;
  height: string;
  x: string;
  y: string;
  rotation?: string;
  opacity: number;
}
export interface DeskPopupData {
  deskId: number;
  deskName: string;
  personAssigned?: string;
  projectAssigned?: string;
}
export interface DeskPopupProps {
  deskData: DeskPopupData;
  position: { x: number; y: number };
  isConferenceRoom?: boolean;
}
export interface MultipleDeskReservation {
  id: number;
  name: string;
}
