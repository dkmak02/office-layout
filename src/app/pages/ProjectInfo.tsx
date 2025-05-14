"use client";

import { useState, useEffect, useMemo } from "react";
import { Table, Spin, Alert, Layout, Select, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Content } from "antd/es/layout/layout";
import useUser from "@/app/util/api/UserApi";
import useProjects from "../util/api/ProjectApi";
import { Project } from "@/app/models/projectModel";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDataContext } from "../util/providers/AppDataContext";
const ProjectInfo = () => {
  const t = useTranslations("ProjectInfo");
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useUser();
  const params = useSearchParams();
  const selectedFloor = params.get("floor")?.includes("8")
    ? "Floor 8"
    : "Floor 7";
  const { selectedDate } = useDataContext();
  const {
    allProjects,
    isLoading: projectsLoading,
    isError: projectsError,
    changeProjectColorAsync,
    changeProjectTypeColorAsync,
    changeProjectVisibilityAsync,
  } = useProjects(selectedFloor, selectedDate);
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
    if (allProjects) {
      setProjectList(allProjects);
    }
  }, [allProjects]);

  const [filters, setFilters] = useState<{
    name: string[];
    code: string[];
    visibility: boolean | null;
  }>({
    name: [],
    code: [],
    visibility: null,
  });

  const handleFilterChange = (key: "name" | "code", value: string[]): void => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleVisibilityChange = (value: boolean | string | null) => {
    if (value === null || value === undefined) {
      setFilters((prev) => ({ ...prev, visibility: null }));
    } else {
      const boolValue = value === "true" || value === true;
      setFilters((prev) => ({ ...prev, visibility: boolValue }));
    }
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
  const handleVisibilityChangeServer = async (
    projectId: number,
    visibility: boolean
  ) => {
    setProjectList((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, visibility } : project
      )
    );
    try {
      await changeProjectVisibilityAsync({
        projectId,
        visibility,
      });
    } catch (error) {
      setProjectList((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...project, visibility: !visibility }
            : project
        )
      );
      console.error("Error changing project visibility:", error);
    }
  };

  const filteredData = projectList.filter((project) => {
    return (
      (filters.code.length === 0 || filters.code.includes(project.code)) &&
      (filters.name.length === 0 || filters.name.includes(project.name)) &&
      (filters.visibility === null || project.visibility === filters.visibility)
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
  const visibilityOptions = [
    { value: true, label: t("visible") },
    { value: false, label: t("hidden") },
  ];

  const columnHeaderStyle = {
    display: "block",
    whiteSpace: "normal",
    overflow: "visible",
  } as const;

  const columns: ColumnsType<Project> = [
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("code")}</div>
          <Select
            mode="multiple"
            size="small"
            placeholder={t("filterCode")}
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
          <div>{t("description")}</div>
          <Select
            mode="multiple"
            size="small"
            placeholder={t("filterDescription")}
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
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("visibility")}</div>
          <Select
            size="small"
            placeholder={t("filterVisibility")}
            value={
              filters.visibility === null
                ? undefined
                : String(filters.visibility)
            }
            onChange={(value) =>
              handleVisibilityChange(value === undefined ? null : value)
            }
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {visibilityOptions.map((opt) => (
              <Select.Option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "visibility",
      key: "visibility",
      width: 300,
      ellipsis: true,
      render: (value: boolean, record: Project) => (
        <Select
          size="small"
          value={String(value)}
          onChange={(val) =>
            handleVisibilityChangeServer(record.id, val === "true")
          }
          style={{ width: "100%" }}
          disabled={record.code === "Hotdesk" || record.total > 0}
        >
          {visibilityOptions.map((opt) => (
            <Select.Option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: <div style={{ textAlign: "center" }}>{t("color")}</div>,
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
