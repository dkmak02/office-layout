import { Desk } from "@/app/models/deskModel";

const MAX_DATE = new Date(8640000000000000);
  const isCurrentDateInRange = (startTime: string, endTime: string) => {
    const currentDate = new Date();
    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : MAX_DATE;
    return currentDate >= startDate && currentDate <= endDate;
  };
export function findProjectDesksByCode(
  desks: Desk[],
  selectedProjects: string[] | null
): Desk[] {
  return desks.filter(
    (desk) =>
      selectedProjects?.includes(desk.project.code) ||
      (selectedProjects?.includes("Hotdesk") && desk.hotdesk === true)
  );
}
export function findProjectDesksByCodeAndEmployees(
  desks: Desk[],
  selectedProjects: string[] | null,
  selectedEmployees: number[]
): Desk[] {
  return desks.filter((desk) => {
    const hasReservationForSelected = desk.reservations.some(
      (reservation) =>
        selectedEmployees.includes(reservation.userId) &&
        isCurrentDateInRange(reservation.startTime, reservation.endTime)
    );
    const isSelectedProject =
      selectedProjects?.includes(desk.project.code) ||
      (selectedProjects?.includes("Hotdesk") && desk.hotdesk === true);
    return hasReservationForSelected || isSelectedProject;
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
export function findDesks(
  employeeIds: number[],
  projectCodes: string[],
  desks: Desk[]
): Desk[] {
  if (employeeIds.length === 0 && projectCodes.length === 0) {
    return desks.map((desk) => ({ ...desk, opacity: desk.baseOpacity }));
  }
  if (employeeIds.length > 0 && projectCodes.length !== 0) {
    const filteredDesks = findProjectDesksByCodeAndEmployees(
      desks,
      projectCodes,
      employeeIds
    );
    return desks.map((desk) => {
      const isFiltered = filteredDesks.some(
        (filteredDesk) => filteredDesk.deskId === desk.deskId
      );
      return { ...desk, opacity: isFiltered ? 1 * desk.baseOpacity : 0 };
    });
  }
  if (employeeIds.length > 0) {
    const employeeDesks = findProjectDesksByEmployees(desks, employeeIds);
    return desks.map((desk) => {
      const isFiltered = employeeDesks.some(
        (filteredDesk) => filteredDesk.deskId === desk.deskId
      );
      return { ...desk, opacity: isFiltered ? 1 * desk.baseOpacity : 0 };
    });
  }
  if (projectCodes.length !== 0) {
    const projectDesks = findProjectDesksByCode(desks, projectCodes);
    return desks.map((desk) => {
      const isFiltered = projectDesks.some(
        (filteredDesk) => filteredDesk.deskId === desk.deskId
      );
      return { ...desk, opacity: isFiltered ? 1 * desk.baseOpacity : 0 };
    });
  }
  return desks;
}