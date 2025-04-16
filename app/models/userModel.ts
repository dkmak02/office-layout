import { Reservation } from "./deskModel";

export interface User {
    id: number;
    name: string;
    surname: string;
    position: string;
    reservations: Reservation[];
}