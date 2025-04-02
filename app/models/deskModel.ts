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
  color: string;
  width: string;
  height: string;
  x: string;
  y: string;
  transform?: string;
}
