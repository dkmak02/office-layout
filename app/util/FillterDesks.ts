import { Desk } from "../models/deskModel";
const MAX_DATE = new Date(8640000000000000);
  const isCurrentDateInRange = (startTime: string, endTime: string) => {
    const currentDate = new Date();
    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : MAX_DATE;
    return currentDate >= startDate && currentDate <= endDate;
  };
export function findProjectDesksByCode(
  desks: Desk[],
  selectedProject: string | null
): Desk[] {
  return desks.filter((desk) => desk.project.code === selectedProject || (selectedProject === "Hotdesk" && desk.hotdesk === true));
}
export function findProjectDesksByCodeAndEmployees(
    desks: Desk[],
    selectedProject: string | null,
    selectedEmployees: number[]
    ): Desk[] {
    return desks.filter((desk) => {
        const hasReservationForSelected = desk.reservations.some(
          (reservation) =>
            selectedEmployees.includes(reservation.userId) &&
            isCurrentDateInRange(reservation.startTime, reservation.endTime)
        );
        const isSelectedProject = desk.project.code === selectedProject || (selectedProject === "Hotdesk" && desk.hotdesk === true);
        return hasReservationForSelected && isSelectedProject;
    });
    }
export function findProjectDesksByEmployees(
    desks: Desk[],
    selectedEmployees: number[]
): Desk[] {
    if (selectedEmployees.length === 0) {
        return desks;
    }

    return desks.filter((desk) =>
      desk.reservations.some(
        (reservation) =>
          selectedEmployees.includes(reservation.userId) &&
          isCurrentDateInRange(reservation.startTime, reservation.endTime)
      )
    );
}
export function findDesks(employeeIds: number[], projectCode:string, desks: Desk[]): Desk[] {
    if (employeeIds.length === 0 && projectCode === "") {
      return desks.map((desk) => ({ ...desk, opacity: 1 }));
    }
    if (employeeIds.length > 0 && projectCode !== "") {
      const filteredDesks = findProjectDesksByCodeAndEmployees(
        desks,
        projectCode,
        employeeIds
      );
      return desks.map((desk) => {
        const isFiltered = filteredDesks.some(
          (filteredDesk) => filteredDesk.deskId === desk.deskId
        );
        return { ...desk, opacity: isFiltered ? 1 : 0.5 };
      });
    }
    if (employeeIds.length > 0) {
      const employeeDesks = findProjectDesksByEmployees(desks, employeeIds);
      return desks.map((desk) => {
        const isFiltered = employeeDesks.some(
          (filteredDesk) => filteredDesk.deskId === desk.deskId
        );
        return { ...desk, opacity: isFiltered ? 1 : 0.5 };
      });
    }
    if (projectCode !== "") {
        const projectDesks = findProjectDesksByCode(desks, projectCode);
        return desks.map((desk) => {
            const isFiltered = projectDesks.some(
                (filteredDesk) => filteredDesk.deskId === desk.deskId
            );
            return { ...desk, opacity: isFiltered ? 1 : 0.5 };
        });
    }
    return desks;

}