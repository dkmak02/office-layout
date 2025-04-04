export interface Reservation {
  reservationId: number;
  startTime: string;
  endTime: string;
  userId: number;
  userName: string;
}
export interface Group {
  code: string;
  projectName: string;
}
export interface Desk {
  name: string;
  deskId: number;
  group: Group[];
  hotdesk: boolean;
  reservations: Reservation[];
  currentReservation?: Reservation;
  color: string;
  width: string;
  height: string;
  x: string;
  y: string;
  rotation?: string;
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
