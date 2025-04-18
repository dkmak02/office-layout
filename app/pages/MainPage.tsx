"use client";
import "@ant-design/v5-patch-for-react-19";
import React, { use, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import tinycolor from "tinycolor2";
import Selecto from "react-selecto";
import DeskReservationForm from "../components/DeskReservationForm";
import DeskPopup from "../components/DeskPopup";
import useDesks from "../util/api/DesksApi";
import MultipleFormAssigment from "../components/MultipleFormAssigment";
import {
  Breadcrumb,
  Layout,
  message,
  theme,
  Select,
  Button,
  Space,
  Modal,
  List,
  Card,
  Timeline,
} from "antd";
import NavbarMenu from "../components/nav-bar-components/Menu";
import "./../styles/MainPage.css";
import ProjectSider from "../components/sidebar-components/ProjectSider";
import useEmployees from "../util/api/GetEmployees";
import { FloorComponentProps } from "../models/componentsModels";
import { useDataContext } from "../util/providers/AppDataContext";
import { Desk, DeskPopupData, Reservation } from "../models/deskModel";
import { findDesks } from "../util/FillterDesks";
import useUser from "../util/api/UserApi";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useHandleDeleteReservation } from "../util/handlers/deleteReservation";
import DaySwitcher from "../components/DaySwitcher";
const { Header, Content } = Layout;
const floorComponents: any = {
  floor7: require("../components/floors/Floor7"),
  floor8: require("../components/floors/Floor8"),
};

const MainPage = () => {
  const queryClient = useQueryClient();
  const { handleDeleteReservationCurrentUser } = useHandleDeleteReservation();
  const {
    selectedEmployees,
    setSelectedEmployees,
    choosenProject,
    selectedFloor,
    setSelectedFloor,
    setCurrentReservations,
    currentReservations,
    selectedDate,
  } = useDataContext();
  const { data: desksData } = useDesks(selectedFloor, selectedDate);
  const { data: userData } = useUser();
  const [SvgComponent, setSvgComponent] =
    useState<React.FC<FloorComponentProps> | null>(null);
  const { data: allEmployees } = useEmployees();
  const [popupData, setPopupData] = useState<DeskPopupData | null>(null);
  const [showDeskPopup, setShowDeskPopup] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<Desk[]>([]);
  const [showMultipleFormModal, setShowMultipleFormModal] =
    useState<boolean>(false);
  const [showUsersReservation, setShowUsersReservation] =
    useState<boolean>(false);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  useEffect(() => {
    if (desksData) {
      const coloredDesks = findDesks(
        selectedEmployees,
        choosenProject,
        desksData
      );
      setDesks(coloredDesks);
    }
  }, [desksData, selectedEmployees, choosenProject]);
  useEffect(() => {
    const loadFloorComponent = async () => {
      if (!selectedFloor || !desks) return;
      const floorKey = selectedFloor.toLowerCase().replace(/\s+/g, "");
      if (!floorComponents[floorKey]) {
        console.warn(`No component found for floor: ${selectedFloor}`);
        setSvgComponent(null);
        return;
      }

      try {
        const component = await floorComponents[floorKey];
        setSvgComponent(() => component.default);
      } catch (error) {
        console.error("Error loading the floor component:", error);
        message.error("Failed to load the floor component.");
        setSvgComponent(null);
      }
    };

    loadFloorComponent();
  }, [selectedFloor, desks]);

  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);
    setShowReservationForm(true);
  };
  const handleDeskHover = (
    event: React.MouseEvent<SVGRectElement>,
    desk: Desk
  ) => {
    const position = {
      x: event.clientX,
      y: event.clientY,
    };
    const deskId = desk.deskId;
    const deskName = desk.name;
    const currentReservation = desk.reservations.find(
      (reservation) => reservation.reservationID === desk.currentReservationID
    );
    const personAssigned = currentReservation
      ? currentReservation.userName
      : undefined;
    const projectAssigned = desk.hotdesk ? "Hotdesk" : desk.project.projectName;
    setPopupData({
      deskId,
      deskName,
      personAssigned,
      projectAssigned,
    });
    setPopupPosition(position);
    setShowDeskPopup(true);
  };
  const handleLeave = () => {
    setShowDeskPopup(false);
  };
  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const darkenColor = (color: string, percent: number): string => {
    return tinycolor(color)
      .darken(percent * 100)
      .toString();
  };
  const handleDeskReservationSubmit = () => {
    setShowDeskPopup(false);
    setSelectedDesk(null);
    setShowReservationForm(false);
  };
  const handleEmployeeSelected = (employeeIds: number[]) => {
    setSelectedEmployees(employeeIds);
    // const filteredDesks = findDesks(employeeIds, choosenProject, desks);
    // queryClient.setQueryData(
    //   ["floors", selectedFloor, selectedDate],
    //   filteredDesks
    // );
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
  const handleUserNameClick = () => {
    setShowUsersReservation(true);
    setCurrentReservations(userData?.reservations || []);
  };
  const genterateCard = (reservation: Reservation) => {
    const startDate = dayjs(reservation.startTime).format("YYYY-MM-DD");
    const endDate =
      reservation.endTime === null
        ? "Brak daty zakończenia"
        : dayjs(reservation.endTime).format("YYYY-MM-DD");
    console.log(reservation);
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
      <Layout>
        <Header style={{ display: "flex", alignItems: "center" }}>
          <NavbarMenu handleFloorChange={handleFloorChange} />
          <Button
            type="primary"
            onClick={handleUserNameClick}
            style={{ borderRadius: 0, height: "100%" }}
          >
            {userData?.name} {userData?.surname}
          </Button>
        </Header>
        <Layout>
          <ProjectSider
            selectedFloor={selectedFloor}
            darkenColor={darkenColor}
          />
          <Layout style={{ padding: "0 24px 24px" }}>
            <div className="flex justify-between items-center gap-4 mt-4 mb-2">
              <Select
                mode="multiple"
                showSearch
                placeholder="Wyszukaj osobę"
                optionFilterProp="label"
                onChange={handleEmployeeSelected}
                options={allEmployees?.map((emp: any) => ({
                  value: emp.id,
                  label: emp.name + " " + emp.surname,
                }))}
                style={{
                  minWidth: 250,
                  flex: 1,
                  maxWidth: "50%",
                }}
                optionRender={(option) => <Space>{option.data.label}</Space>}
              />

              <div>
                <DaySwitcher />
              </div>
            </div>
            <Breadcrumb
              items={[{ title: selectedFloor }]}
              style={{ margin: "16px 0" }}
            />
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                height: "100%",
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
              className="selectable-container"
            >
              <div>
                {userData?.isAdmin && (
                  <Selecto
                    dragContainer={".selectable-container"}
                    selectableTargets={[".desk"]}
                    hitRate={100}
                    ratio={0}
                    selectByClick={false}
                    onSelect={(e) => {
                      const added = e.added.map((el) => ({
                        id:
                          desks.find((d) => d.deskId === Number(el.id))
                            ?.deskId || null,
                        name:
                          desks.find((d) => d.deskId === Number(el.id))?.name ||
                          null,
                      }));
                      const removed = e.removed.map((el) => Number(el.id));
                      setSelectedElements((prev: any) => [
                        ...prev.filter((el: any) => !removed.includes(el.id)),
                        ...added,
                      ]);
                    }}
                    onSelectEnd={() => {
                      setShowMultipleFormModal(selectedElements.length > 0);
                    }}
                  />
                )}

                {SvgComponent && desks && (
                  <SvgComponent
                    desks={desks}
                    handleDeskClick={handleDeskClick}
                    handleDeskHover={handleDeskHover}
                    handleLeave={handleLeave}
                  />
                )}
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
      {showDeskPopup && popupData && (
        <DeskPopup
          deskData={popupData}
          position={popupPosition || { x: 0, y: 0 }}
          isConferenceRoom={false}
        />
      )}
      {showReservationForm && selectedDesk && (
        <DeskReservationForm
          desk={selectedDesk}
          selectedFloor={selectedFloor}
          onSubmit={handleDeskReservationSubmit}
          onCancel={() => setShowReservationForm(false)}
          employees={allEmployees || []}
        />
      )}
      {showMultipleFormModal && (
        <MultipleFormAssigment
          selectedDesks={selectedElements}
          selectedFloor={selectedFloor}
          showMultipleFormModal={showMultipleFormModal}
          setShowMultipleFormModal={setShowMultipleFormModal}
        />
      )}
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

export default MainPage;


