"use client";
import { useDesks } from "@/api/queries/desk/desks-api";
import { Desk } from "@/models/Desk";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useEmployeeSearchContext } from "@/util/providers/EmployeeSearchContext";
import { useState } from "react";
import ReservationModal from "@/components/modals/ReservationModal";
import { useEmployees, useUnassignedEmployees } from "@/api/queries/employees/employee-api";

import { useUser } from "@/api/queries/auth/get-user";

type GenerateDesksProps = {
  floor: string;
};
const GenerateDesks: React.FC<GenerateDesksProps> = ({ floor }) => {
  const { selectedEmployees, selectedProjects } = useEmployeeSearchContext();
  const searchParams = useSearchParams();
  const t = useTranslations("Desk");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const { data: user } = useUser();
  
  const date = searchParams.get("date") ? searchParams.get("date") : dayjs().format("YYYY-MM-DD");
  const formattedDate = dayjs(date)
    .format("YYYY-MM-DDTHH:mm:ss");

  const { data: desks, isLoading, isError } = useDesks(floor, formattedDate);
  const { data: employees } = useEmployees();
  const { data: unassignedEmployees } = useUnassignedEmployees(formattedDate);
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
    // Check if user is a regular employee (not admin or moderator) and desk is a project desk
    const isAdmin = user?.isAdmin || user?.isModerator;
    if (!isAdmin && !desk.hotdesk) {
      // Regular employees cannot click on project desks
      return;
    }
    
    setSelectedDesk(desk);
    setModalVisible(true);
  };
  
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedDesk(null);
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
    <>
    <g data-testid="desks-container">
      {desks.map((desk: Desk) => {
        const projectCode = desk.hotdesk ? "Hotdesk" : desk.project.code;
        const reservation = desk.reservations?.find(r => r.reservationID === desk.currentReservationID)?.userId;
        const isSelected = (selectedEmployees.length > 0 && reservation && selectedEmployees.includes(Number(reservation)))
         || (selectedProjects.length > 0 && selectedProjects.includes(projectCode));
        const hasActiveFilters = selectedEmployees.length > 0 || selectedProjects.length > 0;
        
        // Calculate opacity based on filters and reservation status
        let opacity = 1;
        if (hasActiveFilters) {
          if (isSelected) {
            // Selected desks: different opacity based on reservation status
            opacity = desk.currentReservationID ? 1 : 0.7;
          } else {
            // Non-selected desks when filters are active
            opacity = 0.5;
          }
        } else {
          // No filters active: opacity based on reservation status
          opacity = desk.currentReservationID ? 1 : 0.7;
        }

        // Check if desk is clickable for current user
        const isAdmin = user?.isAdmin || user?.isModerator;
        const isClickable = isAdmin || desk.hotdesk;
        
        return (
          <Tooltip
            key={desk.deskId}
            title={
              <div className="p-3 rounded-lg bg-white min-w-[240px]">
                <div className="flex items-center font-bold text-blue-600 mb-2 border-b border-gray-200 pb-2">
                  <span className="text-lg">{desk.name}</span>
                </div>
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
              style={{ 
                transform: `rotate(${desk.rotation}deg)`,
                cursor: isClickable ? 'pointer' : 'default'
              }}
              opacity={opacity}
              onClick={isClickable ? () => handleDeskClick(desk) : undefined}
              fill={desk.color || "#e0e0e0"}
              data-testid={`desk-${desk.name}`}
              data-desk-type={desk.hotdesk ? "hotdesk" : "project"}
              data-desk-status={desk.currentReservationID ? 'reserved' : 'available'}
            />
          </Tooltip>
        );
      })}
    </g>
    
    <ReservationModal
      visible={modalVisible}
      onClose={handleModalClose}
      desk={selectedDesk}
      employees={employees || []}
      availableEmployees={unassignedEmployees || []}
      floor={floor}
      date={date || undefined}
    />
    </>
  );
};
export default GenerateDesks;
