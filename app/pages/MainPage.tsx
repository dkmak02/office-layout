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
import { Breadcrumb, Layout, message, theme, Select, Space } from "antd";
import NavbarMenu from "../components/nav-bar-components/Menu";
import "./../styles/MainPage.css";
import ProjectSider from "../components/sidebar-components/ProjectSider";
import useEmployees from "../util/api/GetEmployees";
import { FloorComponentProps } from "../models/componentsModels";
import { useFillter } from "../util/providers/SelectedProjectsEmployeesContext";
import { Desk, DeskPopupData } from "../models/deskModel";
import { findDesks } from "../util/FillterDesks";
const { Header, Content } = Layout;
const floorComponents: any = {
  floor7: require("../components/floors/Floor7"),
  floor8: require("../components/floors/Floor8"),
};
const MAX_DATE = new Date(8640000000000000);

const MainPage = () => {
  const queryClient = useQueryClient();
  const [selectedFloor, setSelectedFloor] = useState("Floor 7");
  const { data: desksData } = useDesks(selectedFloor);
  const [SvgComponent, setSvgComponent] =
    useState<React.FC<FloorComponentProps> | null>(null);
  const { data: allEmployees } = useEmployees();
  const [popupData, setPopupData] = useState<DeskPopupData | null>(null);
  const [showDeskPopup, setShowDeskPopup] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<Desk[]>([]);
  const { setSelectedEmployees, choosenProject } = useFillter();
  const [showMultipleFormModal, setShowMultipleFormModal] =
    useState<boolean>(false);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  useEffect(() => {
    const loadFloorComponent = async () => {
      if (!selectedFloor || !desksData) return;
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
  }, [selectedFloor, desksData]);

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
  const isCurrentDateInRange = (startTime: string, endTime: string) => {
    const currentDate = new Date();
    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : MAX_DATE;
    return currentDate >= startDate && currentDate <= endDate;
  };
  const handleEmployeeSelected = (employeeIds: number[]) => {
    setSelectedEmployees(employeeIds);
    const filteredDesks = findDesks(
      employeeIds,
      choosenProject,
      desksData || []
    );
    queryClient.setQueryData(["floors", selectedFloor], filteredDesks);
  };

  return (
    <>
      <Layout>
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div className="demo-logo" />
          <NavbarMenu handleFloorChange={handleFloorChange} />
        </Header>
        <Layout>
          <ProjectSider
            selectedFloor={selectedFloor}
            darkenColor={darkenColor}
          />
          <Layout style={{ padding: "0 24px 24px" }}>
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
                marginTop: 16,
                maxWidth: "50%",
              }}
              optionRender={(option) => <Space>{option.data.label}</Space>}
            />
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
                <Selecto
                  dragContainer={".selectable-container"}
                  selectableTargets={[".desk"]}
                  hitRate={100}
                  ratio={0}
                  selectByClick={false}
                  onSelect={(e) => {
                    const added = e.added.map((el) => ({
                      id:
                        (desksData ?? []).find(
                          (d) => d.deskId === Number(el.id)
                        )?.deskId || null,
                      name:
                        (desksData ?? []).find(
                          (d) => d.deskId === Number(el.id)
                        )?.name || null,
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
                {SvgComponent && desksData && (
                  <SvgComponent
                    desks={desksData}
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
    </>
  );
};

export default MainPage;


