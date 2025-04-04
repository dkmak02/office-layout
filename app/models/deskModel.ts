export interface Reservation {
  startTime: string;
  endTime: string;
  userId: number;
  userName: string;
}

export interface Desk {
  name: string;
  deskId: number;
  group: string[];
  hotdesk: boolean;
  reservations: Reservation[];
  currentReservation?: Reservation;
  color: string;
  width: string;
  height: string;
  x: string;
  y: string;
  transform?: string;
}
export interface DeskPopupData {
  deskName: string;
  personAssigned?: string;
  projectAssigned?: string;
}
export interface DeskPopupProps {
  deskData: DeskPopupData;
  position: { x: number; y: number };
  isConferenceRoom?: boolean;
}
