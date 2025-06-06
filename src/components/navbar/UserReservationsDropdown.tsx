import React from "react";
import { Dropdown, Button, Spin, Alert, Empty, Space } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
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

  const handleDeleteReservation = (reservationId: number) => {
    const reservation = reservations.find(r => r.reservationID === reservationId);
    const useHotdesk = reservation ? shouldUseHotdeskEndpoint(reservation, user) : false;
    
    deleteReservationMutation.mutate({ 
      reservationId,
      useHotdeskEndpoint: useHotdesk
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
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.reservationID}
              reservation={reservation}
              onDelete={handleDeleteReservation}
              loading={deleteReservationMutation.isPending && deleteReservationMutation.variables?.reservationId === reservation.reservationID}
            />
          ))}
        </Space>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="primary"
        icon={<UserOutlined />}
        style={{ height: "64px", lineHeight: "64px", borderRadius: "0px" }}
      >
        {userName}
      </Button>
    </Dropdown>
  );
};

export default UserReservationsDropdown; 