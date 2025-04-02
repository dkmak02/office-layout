import { Desk } from "./deskModel";
export interface SvgComponentProps {
    desks: any[];
  handleConferenceRoomHover: () => void;
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
  handleConferenceRoomHover: () => void;
  handleDeskClick: (deskId: number) => void;
  handleDeskHover: (
    event: React.MouseEvent<SVGRectElement>,
    desk: Desk
  ) => void;
  handleLeave: () => void;
}

export type FloorComponent = React.FC<FloorComponentProps>;

export type FloorComponentImport = () => Promise<{ default: FloorComponent }>;

export type FloorComponentsMap = Record<string, FloorComponentImport>;