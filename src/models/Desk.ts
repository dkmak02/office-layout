export type Desk = {
  deskId: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  color?: string;
  currentReservationID?: string;
};
