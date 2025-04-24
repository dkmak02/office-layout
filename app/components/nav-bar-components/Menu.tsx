"use client";
import { Card, Menu, message, Timeline } from "antd";
import { Header } from "antd/es/layout/layout";
import { Button, Modal, List } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useDataContext } from "@/app/util/providers/AppDataContext";
import { useState } from "react";
import useUser from "../../util/api/UserApi";
import { Reservation } from "@/app/models/deskModel";
import dayjs from "dayjs";
import { useHandleDeleteReservation } from "@/app/util/handlers/deleteReservation";
import Link from "next/link";

const NavbarMenu = () => {
  const { handleDeleteReservationCurrentUser } = useHandleDeleteReservation();
  const { setSelectedFloor, setCurrentReservations, currentReservations } =
    useDataContext();
  const { data: userData } = useUser();
  const [showUsersReservation, setShowUsersReservation] =
    useState<boolean>(false);

  const handleUserNameClick = () => {
    setShowUsersReservation(true);
    setCurrentReservations(userData?.reservations || []);
  };

  const floorsData = [
    {
      key: "Floor 7",
      label: <Link href="/">Floor 7</Link>,
    },
    {
      key: "Floor 8",
      label: <Link href="/">Floor 8</Link>,
    },
  ];
  if (userData?.isAdmin) {
    floorsData.push({
      key: "unassigned",
      label: <Link href="/unassignedEmployees">Unassigned Employees</Link>,
    });
  }

  const handleNavbarItemChange = (key: string) => {
    if (key.includes("Floor")) {
      setSelectedFloor(key);
    }
  };

  const handleCardUnreserv = async (reservationId: number) => {
    try {
      await handleDeleteReservationCurrentUser(reservationId);
      message.success("Reservation unreserved successfully.");
    } catch (error) {
      console.error("Unreserve failed:", error);
      message.error("Failed to unreserve the desk.");
    }
  };

  const genterateCard = (reservation: Reservation) => {
    const startDate = dayjs(reservation.startTime).format("YYYY-MM-DD");
    const endDate =
      reservation.endTime === null
        ? "Brak daty zakończenia"
        : dayjs(reservation.endTime).format("YYYY-MM-DD");
    return (
      <Card
        key={reservation.reservationID}
        title={`Rezerwacja: ${reservation.deskNo}`}
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
        <Button
          danger
          onClick={() => handleCardUnreserv(reservation.reservationID)}
          style={{ margin: 0 }}
        >
          Usuń rezerwację
        </Button>
      </Card>
    );
  };

  return (
    <>
      {/* Sticky Header */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          position: "sticky", // This will make the header sticky
          top: 0, // It will stay on top
          zIndex: 999, // Ensure the header stays above other content
          width: "100%", // Ensure it takes full width
          backgroundColor: "#001529", // Optional: You can customize the background color
          height: "64px",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["Floor 7"]}
          items={floorsData}
          style={{ flex: 1, minWidth: 0 }}
          onClick={(e) => handleNavbarItemChange(e.key)}
        />
        <Button
          type="primary"
          onClick={handleUserNameClick}
          style={{ borderRadius: 0, height: "100%" }}
        >
          {userData?.name} {userData?.surname}
        </Button>
      </Header>

      {/* Modal for User Reservations */}
      {showUsersReservation && (
        <Modal
          title="Moje rezerwacje"
          open={showUsersReservation}
          onCancel={() => setShowUsersReservation(false)}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <List
            dataSource={currentReservations}
            renderItem={(item: Reservation) => genterateCard(item)}
            style={{
              maxHeight: 600,
              overflowY: "auto",
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default NavbarMenu;
