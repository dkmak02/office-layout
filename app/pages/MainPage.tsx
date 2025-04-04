"use client";
import React, { useEffect, useState } from "react";
import tinycolor from "tinycolor2";
import dynamic from "next/dynamic";
import Selecto from "react-selecto";
import DeskForm from "../components/DeskForm";
import DeskPopup from "../components/DeskPopup";
import useDesks from "../util/queries/GetDesks";
import { FloorComponentsMap } from "../models/componentsModels";
import dayjs from "dayjs";
import {
  Breadcrumb,
  Layout,
  Menu,
  message,
  theme,
  Card,
  Select,
  Space,
  Modal,
  Button,
  Timeline,
  List,
  Typography,
} from "antd";
import NavbarMenu from "../components/nav-bar-components/Menu";
import "./../styles/MainPage.css";
import ProjectSider from "../components/sidebar-components/ProjectSider";
import useEmployees from "../util/queries/GetEmployees";
import { FloorComponentProps } from "../models/componentsModels";
import useProjects from "../util/queries/GetProjects";
import { Desk, DeskPopupData } from "../models/deskModel";
import { Project } from "../models/projectModel";
const { Header, Content } = Layout;
const floorComponents: any = {
  floor7: dynamic(() => import("../components/floors/Floor7"), { ssr: false }),
  floor8: dynamic(() => import("../components/floors/Floor8"), { ssr: false }),
};
const MainPage = () => {
  const [selectedFloor, setSelectedFloor] = useState("Floor 7");
  const { data: desksData } = useDesks(selectedFloor);
  const [SvgComponent, setSvgComponent] =
    useState<React.FC<FloorComponentProps> | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { data: allEmployees } = useEmployees();
  const [popupData, setPopupData] = useState<DeskPopupData | null>(null);
  const [showDeskPopup, setShowDeskPopup] = useState<boolean>(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
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
        const component = await floorComponents[floorKey]();
        setSvgComponent(() => component.default);
      } catch (error) {
        console.error("Error loading the floor component:", error);
        message.error("Failed to load the floor component.");
        setSvgComponent(null);
      }
    };

    loadFloorComponent();
  }, [selectedFloor, desksData]);

  const handleConferenceRoomHover = () => {};

  const handleDeskClick = () => {};
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
    const currentReservation = desk.currentReservation;
    const personAssigned = currentReservation
      ? currentReservation.userName
      : undefined;
    const projectAssigned = "Hotdesk";
    setPopupData({
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
  const handleSelectedProjectChange = (project: Project) => {
    if (selectedProject && selectedProject === project.code) {
      setSelectedProject(null);
    } else {
      setSelectedProject(project.code);
    }
  };
  const darkenColor = (color: string, percent: number): string => {
    return tinycolor(color)
      .darken(percent * 100)
      .toString();
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
          handleSelectedProjectChange={handleSelectedProjectChange}
          selectedProject={selectedProject}
          darkenColor={darkenColor}
        />
        <Layout style={{ padding: "0 24px 24px" }}>
          <Select
            mode="multiple"
            showSearch
            placeholder="Wyszukaj osobę"
            optionFilterProp="label"
            // onChange={onChange}
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
          >
            <div>
              {SvgComponent ? (
                <SvgComponent
                  desks={desksData || []}
                  handleConferenceRoomHover={handleConferenceRoomHover}
                  handleDeskClick={handleDeskClick}
                  handleDeskHover={handleDeskHover}
                  handleLeave={handleLeave}
                />
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
    {/* {showDeskPopup && popupData && (
      <DeskPopup
        deskData={popupData}
        position={popupPosition || { x: 0, y: 0 }}
        isConferenceRoom={false}
      />
    )} */}
    </>
  );
};

export default MainPage;
