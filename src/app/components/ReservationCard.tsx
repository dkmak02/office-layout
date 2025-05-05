import { Card, Timeline, Button } from "antd";
import dayjs from "dayjs";
import { Reservation } from "../models/deskModel";
import { ClockCircleOutlined } from "@ant-design/icons";
import { allowDeleteReservation } from "../util/handlers/validatePermisions";
import { User } from "../models/userModel";
import { useTranslations } from "next-intl";
interface GenerateCardProps {
  reservation: Reservation;
  userData: User;
  deskName: string;
  projectCode: string;
  handleCardUnreserv: (reservationId: number) => void;
  validateRoles: (
    userData?: User,
    reservation?: Reservation,
    projectCode?: string
  ) => boolean;
}

const GenerateCard = ({
  reservation,
  userData,
  deskName,
  projectCode,
  handleCardUnreserv,
  validateRoles,
}: GenerateCardProps) => {
  const t = useTranslations("ReservationCard");
  const startDate = dayjs(reservation.startTime).format("YYYY-MM-DD");
  const endDate =
    dayjs(reservation.endTime).year() === 9999
      ? t("reservationNoEndTime")
      : dayjs(reservation.endTime).format("YYYY-MM-DD");

  return (
    <Card
      key={reservation.reservationID}
      title={`${t("reservation")}: ${deskName}`}
      variant="outlined"
      style={{ marginTop: 16 }}
    >
      <Timeline
        style={{ padding: 0, margin: 0 }}
        items={[
          {
            children: reservation.userName,
          },
          {
            dot: <ClockCircleOutlined className="timeline-clock-icon" />,
            color: "red",
            children: startDate + " / " + endDate,
            style: { padding: 0, margin: 0 },
          },
        ]}
      />
      {validateRoles(userData, reservation, projectCode) && (
        <Button
          danger
          onClick={() => handleCardUnreserv(reservation.reservationID)}
          style={{ margin: 0 }}
        >
          {t("deleteReservationButton")}
        </Button>
      )}
    </Card>
  );
};
export default GenerateCard;