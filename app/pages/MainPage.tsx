"use client";
import React, { useEffect, useState } from "react";
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
import { UserOutlined, LaptopOutlined, NotificationOutlined } from "@ant-design/icons";
import "./../styles/MainPage.css";

type Floors = "Floor 7" | "Floor 8";
const { Header, Content, Sider } = Layout;
const MainPage = () => {
  const [floor, setFloor] = useState<Floors>("Floor 7");
  const [SvgComponent, setSvgComponent] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const loadFloorComponent = async () => {
      try {
        const component = await import(`../components/floors/${floor.replace(' ', '')}`);
        setSvgComponent(() => component.default);
      } catch (error) {
        console.error("Error loading the floor component:", error);
      }
    };

    loadFloorComponent();
  }, [floor]); 

  const handleConferenceRoomHover = () => {
    console.log("Conference Room Hovered");
  };

  const handleDeskClick = () => {
    console.log("Desk Clicked");
  };

  const handleDeskHover = () => {
    console.log("Desk Hovered");
  };

  const handleLeave = () => {
    console.log("Mouse Left");
  };
  const items1 = ["1", "2", "3"].map((key) => ({
    key,
    label: `nav ${key}`,
  }));
  const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
    (icon, index) => {
      const key = String(index + 1);
      return {
        key: `sub${key}`,
        icon: React.createElement(icon),
        label: `subnav ${key}`,
        children: Array.from({ length: 4 }).map((_, j) => {
          const subKey = index * 4 + j + 1;
          return {
            key: subKey,
            label: `option${subKey}`,
          };
        }),
      };
    }
  );
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Select
            mode="multiple"
            showSearch
            placeholder="Wyszukaj osobę"
            optionFilterProp="label"
            // onChange={onChange}
            // options={allUsers.map((emp) => ({
            //   value: Number(emp.Id),
            //   label: emp.Name,
            // }))}
            style={{
              marginTop: 16,
              maxWidth: "50%",
            }}
            optionRender={(option) => <Space>{option.data.label}</Space>}
          />
          <Breadcrumb items={[{ title: floor }]} style={{ margin: "16px 0" }} />
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
  );
};

export default MainPage;
