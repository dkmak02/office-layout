export type Reservation = {
  reservationID: number;
  startTime: string;
  endTime: string | null;
  deskNo: string;
};

export type User = {
  id: number;
  name: string;
  surname: string;
  position: string;
  isAdmin: boolean;
  isModerator: boolean;
  reservations: Reservation[];
};
