import { Desk } from "./deskModel";
import { Project } from "./projectModel";
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
  selectedProject: string | null;
  handleSelectedProjectChange: (project: any) => void;
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
}
export interface DeskFormProps {
  desk: Desk;
  onSubmit: (employee: Employee, project: Project) => void;
  onCancel: () => void;
  onUnreserve: (reservationId: number, isTodayDeleted: boolean) => void;
  employees: Employee[];
  projects: Project[];
  onSubmitHotdesk: (
    employee: Employee,
    project: Project,
    dates: {
      startDate: string;
      endDate: string;
    }
  ) => void;
}
export type FloorComponent = React.FC<FloorComponentProps>;

export type FloorComponentImport = () => Promise<{ default: FloorComponent }>;

export type FloorComponentsMap = Record<string, FloorComponentImport>;