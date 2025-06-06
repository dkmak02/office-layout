import React from "react";
import { Card, Button, Tooltip, Space, Typography } from "antd";
import { DeleteOutlined, CalendarOutlined, UserOutlined, DesktopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useUser } from "@/api/queries/auth/get-user";
import { canDeleteReservation, getDeleteButtonTooltip } from "@/util/permissions/reservationPermissions";
import { Reservation } from "@/models/Reservation";

const { Text, Title } = Typography;

interface ReservationCardProps {
  reservation: Reservation;
  onDelete?: (reservationId: number) => void;
  loading?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onDelete,
  loading = false
}) => {
  const { data: user } = useUser();
  const canDelete = canDeleteReservation(reservation, user);
  const deleteTooltip = getDeleteButtonTooltip(reservation, user);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  const handleDelete = () => {
    if (onDelete && canDelete) {
      onDelete(reservation.reservationID);
    }
  };
  return (
    <Card
      size="small"
      className="mb-3 shadow-sm hover:shadow-md transition-shadow"
      styles={{
        body: {
          padding: "16px",
        },
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Space direction="vertical" size="small" className="w-full">
            {/* Desk Name */}
            <div className="flex items-center gap-2">
              <DesktopOutlined className="text-blue-500" />
              <Title level={5} className="!mb-0">
                {reservation.deskNo || "Desk"}
              </Title>
              {/* {reservation.isHotdesk && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Hotdesk
                </span>
              )} */}
            </div>

            {/* Person */}
            <div className="flex items-center gap-2">
              <UserOutlined className="text-green-500" />
              <Text strong>{user?.name} {user?.surname}</Text>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-purple-500" />
              <Space direction="vertical" size={0}>
                <Text className="text-sm">
                  <strong>Start:</strong> {formatDate(reservation.startTime)}
                </Text>
                {reservation.endTime && (
                  <Text className="text-sm">
                    <strong>End:</strong> {formatDate(reservation.endTime)}
                  </Text>
                )}
              </Space>
            </div>
          </Space>
        </div>

        {/* Delete Button */}
        {canDelete && (
          <Tooltip title={deleteTooltip}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={loading}
              className="ml-2"
            />
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default ReservationCard;
