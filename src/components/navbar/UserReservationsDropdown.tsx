import React from "react";
import { Dropdown, Button, Spin, Alert, Empty, Space, message } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import ReservationCard from "@/components/reservations/ReservationCard";
import { useTranslations } from "next-intl";
import { Reservation } from "@/models/Reservation";
import { useDeleteReservation } from "@/api/mutations/reservations/delete-reservation";
import { shouldUseHotdeskEndpoint } from "@/util/permissions/reservationPermissions";
import { useUser } from "@/api/queries/auth/get-user";

interface UserReservationsDropdownProps {
  userName: string;
  reservations: Reservation[];
}

const UserReservationsDropdown: React.FC<UserReservationsDropdownProps> = ({
  userName,
  reservations
}) => {
  const t = useTranslations("NavbarMenu");
  const { data: user } = useUser();
  const deleteReservationMutation = useDeleteReservation();
  
  // Get floor and date from URL params for cache invalidation
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const floor = pathname.split("/").pop() === "floor-7" ? "Floor 7" : "Floor 8";
  const date = searchParams.get("date") ? searchParams.get("date")! : dayjs().format("YYYY-MM-DD");

  const handleDeleteReservation = (reservationId: number) => {
    const reservation = reservations.find(r => r.reservationID === reservationId);
    if (!reservation) return;
    // Determine if this is a hotdesk reservation based on endTime
    const isHotdesk = Boolean(reservation.endTime && 
      reservation.endTime.trim() !== "" && 
      reservation.endTime !== "0001-01-01T00:00:00" && 
      !reservation.endTime.startsWith("0001-01-01"));
    
    // Create extended reservation object with isHotdesk field
    const extendedReservation = { ...reservation, isHotdesk };
    const useHotdesk = shouldUseHotdeskEndpoint(extendedReservation, user);
    
    deleteReservationMutation.mutate({ 
      reservationId,
      useHotdeskEndpoint: useHotdesk,
      floor,
      date
    }, {
      onSuccess: () => {
        message.success(t("unreserveSuccess"));
      },
      onError: (error: any) => {
        console.error("Error deleting reservation:", error);
        message.error(t("unreserveError"));
      }
    });
  };

  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-3 p-2 border-b">
        <CalendarOutlined className="text-blue-500" />
        <span className="font-semibold text-gray-800">
          {t("reservationModalTitle") || "My Reservations"}
        </span>
      </div>
      
      {reservations.length === 0 && (
        <Empty 
          description="No reservations found"
          className="py-4"
        />
      )}
      
      {reservations.length > 0 && (
        <Space direction="vertical" className="w-full">
          {reservations.map((reservation) => {
            // Add the current user's ID to the reservation since API doesn't include it
            // but we know these are the current user's reservations
            const enrichedReservation = {
              ...reservation,
              userId: user?.id || 0,
              userName: user ? `${user.name} ${user.surname}` : ''
            };
            
            return (
              <ReservationCard
                key={reservation.reservationID}
                reservation={enrichedReservation}
                onDelete={handleDeleteReservation}
                loading={deleteReservationMutation.isPending && deleteReservationMutation.variables?.reservationId === reservation.reservationID}
              />
            );
          })}
        </Space>
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      data-testid="user-reservations-dropdown"
    >
      <Button
        type="primary"
        icon={<UserOutlined />}
        style={{ height: "64px", lineHeight: "64px", borderRadius: "0px" }}
        data-testid="user-dropdown-button"
      >
        {userName}
      </Button>
    </Dropdown>
  );
};

export default UserReservationsDropdown; 