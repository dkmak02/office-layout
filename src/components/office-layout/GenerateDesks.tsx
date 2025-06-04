"use client";
import { useDesks } from "@/api/queries/desk/desks-api";
import { Desk } from "@/models/Desk";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useEmployeeSearchContext } from "@/util/providers/EmployeeSearchContext";
type GenerateDesksProps = {
  floor: string;
};
const GenerateDesks: React.FC<GenerateDesksProps> = ({ floor }) => {
  const { selectedEmployees, selectedProjects } = useEmployeeSearchContext();
  const searchParams = useSearchParams();
  const t = useTranslations("Desk");
  const date = searchParams.get("date") ? searchParams.get("date") : dayjs().format("YYYY-MM-DD");
  const formattedDate = dayjs(date)
    .format("YYYY-MM-DDTHH:mm:ss");

  const { data: desks, isLoading, isError } = useDesks(floor, formattedDate);
  if (isLoading) {
    return <text>Loading...</text>;
  }
  if (isError) {
    return <text>Error loading desks</text>;
  }
  if (!desks) {
    return <text>No desks found</text>;
  }
  const handleDeskClick = (desk: Desk) => {
    console.log("Desk clicked:", desk);
  };
  const getReservationInfo = (desk: Desk) => {
    const project = desk.hotdesk ? "Hotdesk" : desk.project?.projectName;
    if (!desk.currentReservationID) return { person: t("noneAssigned"), project};
    const reservation = desk.reservations?.find(r => r.reservationID === desk.currentReservationID);
    return {
      person: reservation?.userName,
      project
    };
  };

  return (
    <g>
      {desks.map((desk: Desk) => {
        const projectCode = desk.hotdesk ? "Hotdesk" : desk.project.code;
        const reservation = desk.reservations?.find(r => r.reservationID === desk.currentReservationID)?.userId;
        const isSelected = (selectedEmployees.length > 0 && reservation && selectedEmployees.includes(Number(reservation)))
         || (selectedProjects.length > 0 && selectedProjects.includes(projectCode));
        const hasActiveFilters = selectedEmployees.length > 0 || selectedProjects.length > 0;
        const opacity = hasActiveFilters ? (isSelected ? 1 : 0.5) : 1;
        return (
          <Tooltip
            key={desk.deskId}
            title={
              <div className="p-3 rounded-lg bg-white min-w-[240px]">
                <div className="flex items-center font-semibold text-gray-800 mb-1">
                  <span className="flex-shrink-0">{t("personAssigned")}:&nbsp;</span>
                  <span className="font-normal text-gray-600 flex-1 truncate overflow-hidden whitespace-nowrap max-w-[180px]">{getReservationInfo(desk).person}</span>
                </div>
                <div className="flex items-center font-semibold text-gray-800">
                  <span className="flex-shrink-0">{t("projectAssigned")}:&nbsp;</span>
                  <span className="font-normal text-gray-600 flex-1 truncate overflow-hidden whitespace-nowrap max-w-[180px]">{getReservationInfo(desk).project}</span>
                </div>
              </div>
            }
            mouseEnterDelay={0.1}
            color="white"
          >
            <rect
              id={desk.deskId.toString()}
              name={desk.name}
              width={desk.width}
              height={desk.height}
              x={desk.x}
              y={desk.y}
              className="desk"
              style={{ transform: `rotate(${desk.rotation}deg)` }}
              opacity={opacity}
              onClick={() => handleDeskClick(desk)}
              fill={desk.color || "#e0e0e0"}
            />
          </Tooltip>
        );
      })}
    </g>
  );
};
export default GenerateDesks;
