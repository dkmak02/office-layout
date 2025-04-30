"use client";

import { useState, useEffect, useMemo } from "react";
import { Table, Spin, Alert, Layout, Select, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Content } from "antd/es/layout/layout";
import useUser from "@/app/util/api/UserApi";
import { useDataContext } from "../util/providers/AppDataContext";
import useProjects from "../util/api/ProjectApi";
import { Project } from "@/app/models/projectModel";
import { usePathname } from "next/navigation";
const ProjectInfo = () => {
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useUser();
  const pathname = usePathname();
  const selectedFloor = pathname.includes("/floor8") ? "Floor 8" : "Floor 7";
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    changeProjectColorAsync,
    changeProjectTypeColorAsync,
  } = useProjects(selectedFloor);

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [projectList, setProjectList] = useState<Project[]>([]);

  useEffect(() => {
    if (userData) {
      setIsAdmin(userData.isAdmin);
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (projects) {
      setProjectList(projects);
    }
  }, [projects]);

  const [filters, setFilters] = useState<{
    name: string[];
    code: string[];
  }>({
    name: [],
    code: [],
  });

  const handleFilterChange = (key: "name" | "code", value: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleColorChange = async (id: number, color: string) => {
    setProjectList((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, color } : project
      )
    );
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(async () => {
      if (id === -170) {
        await changeProjectTypeColorAsync({
          projectType: "Hotdesk",
          color,
        });
      } else {
        await changeProjectColorAsync({ projectId: id, color });
      }
    }, 500);
    setDebounceTimeout(timeout);
  };

  const filteredData = projectList.filter((project) => {
    return (
      (filters.code.length === 0 || filters.code.includes(project.code)) &&
      (filters.name.length === 0 || filters.name.includes(project.name))
    );
  });

  const nameOptions = useMemo(
    () => [...new Set(projectList.map((p) => p.name))],
    [projectList]
  );
  const codeOptions = useMemo(
    () => [...new Set(projectList.map((p) => p.code))],
    [projectList]
  );

  const columnHeaderStyle = {
    display: "block",
    whiteSpace: "normal",
    overflow: "visible",
  } as const;

  const columns: ColumnsType<Project> = [
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>Code</div>
          <Select
            mode="multiple"
            size="small"
            placeholder="Filter code"
            value={filters.code}
            onChange={(value) => handleFilterChange("code", value)}
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {codeOptions.map((code) => (
              <Select.Option key={code} value={code}>
                {code}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "code",
      key: "code",
      width: 200,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>Description</div>
          <Select
            mode="multiple"
            size="small"
            placeholder="Filter description"
            value={filters.name}
            onChange={(value) => handleFilterChange("name", value)}
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {nameOptions.map((name) => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "name",
      key: "name",
      width: 300,
      ellipsis: true,
    },
    {
      title: <div style={{ textAlign: "center" }}>Color</div>,
      dataIndex: "color",
      key: "color",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <label
            style={{
              width: 40,
              height: 40,
              backgroundColor: record.color || "#ccc",
              border: "1px solid #999",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Input
              type="color"
              value={record.color || "#cccccc"}
              onChange={(e) => handleColorChange(record.id, e.target.value)}
              style={{
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </label>
        </div>
      ),
    },
  ];

  if (userLoading || projectsLoading || loading) {
    return <Spin tip="Loading projects..." />;
  }

  if (userError || projectsError) {
    return (
      <Alert
        message="Error"
        description="Failed to load project information."
        type="error"
        showIcon
      />
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="p-8 flex flex-col h-full">
        <div className="flex flex-col flex-grow bg-white p-6 rounded-lg shadow-md min-h-[calc(100vh-64px-4rem)]">
          <div className="flex-grow">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              bordered
              pagination={false}
              scroll={{ x: "100%" }}
              tableLayout="fixed"
              className="rounded-lg"
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ProjectInfo;
