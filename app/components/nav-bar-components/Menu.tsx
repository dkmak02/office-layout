"use client";
import { Card, Menu, message, Timeline } from "antd";
import { Header } from "antd/es/layout/layout";
import { Button, Modal, List } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useDataContext } from "@/app/util/providers/AppDataContext";
import { useState } from "react";
import useUser from "../../util/api/UserApi";
import { Reservation } from "@/app/models/deskModel";
import { allowOwnUnreserv } from "@/app/util/handlers/validatePermisions";
import { useHandleDeleteReservation } from "@/app/util/handlers/deleteReservation";
import GenterateCard from "../ReservationCard";
import Link from "next/link";
import { User } from "@/app/models/userModel";
import { usePathname } from "next/navigation";
const NavbarMenu = () => {
  const pathname = usePathname();

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
      label: <Link href="/floor7">Floor 7</Link>,
    },
    {
      key: "Floor 8",
      label: <Link href="/floor8">Floor 8</Link>,
    },
  ];
  if (userData?.isAdmin) {
    floorsData.push({
      key: "unassigned",
      label: <Link href="/unassignedEmployees">Unassigned Employees</Link>,
    });
    floorsData.push({
      key: "projects",
      label: <Link href="/projectinfo">Projects</Link>,
    });
  }
  const getMenuKeyFromPath = (path: string) => {
    if (path.includes("/unassignedEmployees")) return "unassigned";
    if (path.includes("/projectinfo")) return "projects";
    if (path.includes("/floor8")) return "Floor 8";
    return "Floor 7";
  };

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

  const genterateCard = (
    reservation: Reservation,
    userData: User,
    handleCardUnreserv: (reservationId: number) => void,
    allowOwnUnreserv: () => boolean
  ) => {
    if (!reservation.deskNo) return null;
    return (
      <GenterateCard
        reservation={reservation}
        userData={userData}
        deskName={reservation.deskNo}
        projectCode=""
        handleCardUnreserv={handleCardUnreserv}
        validateRoles={allowOwnUnreserv}
      />
    );
  };
  if (!userData) return null;
  return (
    <>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 999,
          width: "100%",
          backgroundColor: "#001529",
          height: "64px",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getMenuKeyFromPath(pathname)]}
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
            renderItem={(item: Reservation) =>
              genterateCard(
                item,
                userData,
                handleCardUnreserv,
                allowOwnUnreserv
              )
            }
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
