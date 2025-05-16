export interface Employee {
  id: number;
  name: string;
  surname: string;
  position: string;
  availability: string;
  ignoreAvailability: boolean;
}
export interface UnassignedEmployee {
  id: number;
  name: string;
  surname: string;
  companyName: string;
  department: string;
  position: string;
  permanentlyAssigned: boolean;
  availability: string;
  hotdeskReservation: boolean;
  ignoreAvailability: boolean;
}