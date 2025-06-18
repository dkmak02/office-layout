import { Reservation } from "./Reservation";


export type User = {
  id: number;
  name: string;
  surname: string;
  position: string;
  isAdmin: boolean;
  isModerator: boolean;
  reservations: Reservation[];
};
