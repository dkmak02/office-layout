import { Desk } from "./deskModel";
import { Employee } from "./employeeModel";
export interface SvgComponentProps {
  desks: any[];
  handleDeskClick: () => void;
  handleDeskHover: () => void;
  handleLeave: () => void;
}
export interface NavbarMenuProps {
  handleFloorChange: (floorKey: string) => void;
}

export interface ProjectSiderProps {
  selectedFloor: string;
  darkenColor: (color: string, amount: number) => string;
}
export interface FloorComponentProps {
  desks: Desk[];
  handleDeskClick: (desk: Desk) => void;
  handleDeskHover: (
    event: React.MouseEvent<SVGRectElement>,
    desk: Desk
  ) => void;
  handleLeave: () => void;
  backgroundOpacity: number;
}
export interface DeskFormProps {
  desk: Desk;
  selectedFloor: string;
  onSubmit: () => void;
  onCancel: () => void;
  employees: Employee[];
}
export interface MulipleFormAssigmentProps {
  selectedDesks: any[];
  selectedFloor: string;
  showMultipleFormModal: boolean;
  setShowMultipleFormModal: (value: boolean) => void;
}
export type FloorComponent = React.FC<FloorComponentProps>;

export type FloorComponentImport = () => Promise<{ default: FloorComponent }>;

export type FloorComponentsMap = Record<string, FloorComponentImport>;
