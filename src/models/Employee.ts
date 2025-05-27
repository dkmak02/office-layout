export type Employee = {
  id: number;
  name: string;
  surname: string;
  availability: string;
  ignoreAvailability: boolean;
};

export type EmployeeInfo = {
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
};