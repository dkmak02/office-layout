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
import { findDesks } from "../util/handlers/fillterDesks";
import useUser from "../util/api/UserApi";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useHandleDeleteReservation } from "../util/handlers/deleteReservation";
import DaySwitcher from "../components/DaySwitcher";
import { useSearchParams } from "next/navigation";
import useProjects from "../util/api/ProjectApi";
import { useTranslations } from "next-intl";
const { Header, Content } = Layout;
const floorComponents: any = {
  floor7: require("../components/floors/Floor7"),
  floor8: require("../components/floors/Floor8"),
};
const MainPage = () => {
  const t = useTranslations("HomePage");
  const {
    selectedEmployees,
    setSelectedEmployees,
    choosenProjects,
    setCurrentReservations,
    currentReservations,
    selectedDate,
  } = useDataContext();
  const params = useSearchParams();
  const selectedFloor = params.get("floor")?.includes("8")
    ? "Floor 8"
    : "Floor 7";
  const { data: desksData } = useDesks(selectedFloor, selectedDate);
  const { data: userData } = useUser();
  const { syncProjectAsync } = useProjects(selectedFloor, selectedDate);
  const [SvgComponent, setSvgComponent] =
    useState<React.FC<FloorComponentProps> | null>(null);
  const { allEmployees, unassignedEmployeesDate } = useEmployees({
    isAdmin: userData?.isAdmin || false,
    date: selectedDate,
  });
  const [popupData, setPopupData] = useState<DeskPopupData | null>(null);
  const [showDeskPopup, setShowDeskPopup] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<Desk[]>([]);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [showMultipleFormModal, setShowMultipleFormModal] =
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
        choosenProjects,
        desksData
      );
      setDesks(coloredDesks);
      setBackgroundOpacity(
        choosenProjects.length !== 0 || selectedEmployees.length > 0 ? 0.3 : 1
      );
    }
  }, [desksData, selectedEmployees, choosenProjects]);
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
        message.error(t("errorLoadingFloorComponent"));
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
  };
  const handleSyncProjects = async () => {
    try {
      await syncProjectAsync();
      message.success(t("syncSuccess"));
    } catch (error) {
      console.error("Sync failed:", error);
      message.error(t("syncError"));
    }
  };
  return (
    <>
      <Layout
        className="w-full flex flex-col"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <ProjectSider selectedFloor={selectedFloor} darkenColor={darkenColor} />
        <Layout style={{ padding: "0 24px 24px" }}>
          <div className="flex justify-between items-center gap-4 mt-4 mb-2">
            <Select
              mode="multiple"
              showSearch
              placeholder={t("searchEmployee")}
              value={selectedEmployees}
              optionFilterProp="label"
              onChange={handleEmployeeSelected}
              allowClear
              className="mt-1 mb-1 bg-white px-3 py-1 rounded-md shadow-md overflow-y-auto"
              options={allEmployees.data?.map((emp: any) => ({
                value: emp.id,
                label: emp.name + " " + emp.surname,
              }))}
              style={{
                minWidth: 250,
                flex: 1,
                maxWidth: "50%",
              }}
              maxTagCount={4}
              maxTagTextLength={10}
              optionRender={(option) => <Space>{option.data.label}</Space>}
            />
            <div className="flex items-center gap-2">
              {userData?.isAdmin && (
                <Button
                  type="primary"
                  onClick={() => handleSyncProjects()}
                  icon={<ClockCircleOutlined />}
                >
                  {t("sync")}
                </Button>
              )}
            </div>
            <div>
              <DaySwitcher />
            </div>
          </div>
          <Breadcrumb
            items={[{ title: t(`${selectedFloor}`) }]}
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
                        desks.find((d) => d.deskId === Number(el.id))?.deskId ||
                        null,
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
              <div className="relative h-full w-full">
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  {SvgComponent && desks && (
                    <SvgComponent
                      desks={desks}
                      handleDeskClick={handleDeskClick}
                      handleDeskHover={handleDeskHover}
                      handleLeave={handleLeave}
                      backgroundOpacity={backgroundOpacity}
                    />
                  )}
                </div>
              </div>
            </div>
          </Content>
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
          unassignedEmployees={unassignedEmployeesDate.data || []}
          employees={allEmployees.data || []}
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
