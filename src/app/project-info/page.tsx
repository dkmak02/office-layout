"use client";
import { Table, Spin, Alert, Layout, Select, ColorPicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Content } from "antd/es/layout/layout";
import { useTranslations } from "next-intl";
import { Project } from "@/models/Project";
import {useProjectInfo} from "@/api/queries/project/project-api-page";
import RoleGuard from "@/components/auth/RoleGuard";
import React, { useState, useMemo } from "react";
import { useSetProjectColor } from "@/api/mutations/project/set-project-color";
import { useSetProjectVisibility } from "@/api/mutations/project/set-project-visibility";

const ProjectInfo = () => {
  const t = useTranslations("ProjectInfo");
  const { data: allProjects, isLoading: projectsLoading, isError: projectsError } = useProjectInfo();
  const [visibilityFilter, setVisibilityFilter] = useState<string | undefined>(undefined);
  const [codeFilter, setCodeFilter] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>({});
  const [colorMap, setColorMap] = useState<Record<number, string>>({});
  const setProjectColorMutation = useSetProjectColor();
  const setProjectVisibilityMutation = useSetProjectVisibility();

  const codeOptions = useMemo(() =>
    Array.from(new Set((allProjects || []).map((p: Project) => String(p.code)))).map((code) => ({ value: code, label: code })),
    [allProjects]
  );
  const nameOptions = useMemo(() =>
    Array.from(new Set((allProjects || []).map((p: Project) => String(p.name)))).map((name) => ({ value: name, label: name })),
    [allProjects]
  );

  const columns: ColumnsType<Project> = [
    {
      title: (
        <div style={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
          <div>{t("code")}</div>
          <Select
            mode="multiple"
            size="small"
            allowClear
            placeholder={t("filterCode")}
            value={codeFilter}
            onChange={setCodeFilter}
            style={{ width: "100%", minWidth: 0 }}
            options={codeOptions}
            showSearch
            filterOption={(input, option) => ((option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase()))}
          />
        </div>
      ),
      dataIndex: "code",
      key: "code",
      width: 125,
      ellipsis: true,
    },
    {
      title: (
        <div style={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
          <div>{t("description")}</div>
          <Select
            mode="multiple"
            size="small"
            allowClear
            placeholder={t("filterDescription")}
            value={nameFilter}
            onChange={setNameFilter}
            style={{ width: "100%", minWidth: 0 }}
            options={nameOptions}
            showSearch
            filterOption={(input, option) => ((option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase()))}
          />
        </div>
      ),
      dataIndex: "name",
      key: "name",
      width: 300,
      ellipsis: true,
    },
    {
      title: (
        <div style={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
          <div>{t("visibility")}</div>
          <Select
            size="small"
            allowClear
            placeholder={t("filterVisibility")}
            value={visibilityFilter}
            onChange={setVisibilityFilter}
            style={{ width: "100%", minWidth: 0 }}
            options={[
              { value: "true", label: t("visible") },
              { value: "false", label: t("hidden") },
            ]}
          />
        </div>
      ),
      dataIndex: "visibility",
      key: "visibility",
      width: 100,
      ellipsis: true,
      render: (value: boolean, record: Project) => (
        <Select
          size="small"
          value={
            visibilityMap[record.id] !== undefined
              ? String(visibilityMap[record.id])
              : String(value)
          }
          disabled={record.code === "Hotdesk" || record.total > 0}
          onChange={(val) =>
            {
              setVisibilityMap((prev) => ({ ...prev, [record.id]: val === "true" }));
              setProjectVisibilityMutation.mutate({ id: record.id });
            }
          }
          style={{ width: 100 }}
          options={[
            { value: "true", label: t("visible") },
            { value: "false", label: t("hidden") },
          ]}
        />
      ),
    },
    {
      title: t("color"),
      dataIndex: "color",
      key: "color",
      width: 40,
      render: (color: string, record: Project) => (
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>
          <ColorPicker
            value={colorMap[record.id] !== undefined ? colorMap[record.id] : color}
            onChange={(colorValue) => {
              const hexColor = colorValue.toHexString();
              setColorMap((prev) => ({ ...prev, [record.id]: hexColor }));
              setProjectColorMutation.mutate({
                id: record.id,
                color: hexColor,
              });
            }}
            disabled={record.code === "Hotdesk"}
          />
        </div>
      </div>

      ),
    },
  ];

  const filteredProjects = allProjects?.filter((project: Project) => {
    if (codeFilter.length > 0 && !codeFilter.includes(project.code)) return false;
    if (nameFilter.length > 0 && !nameFilter.includes(project.name)) return false;
    if (visibilityFilter !== undefined) {
      if (visibilityFilter === "true" && !project.visibility) return false;
      if (visibilityFilter === "false" && project.visibility) return false;
    }
    return true;
  });

  if (projectsLoading) {
    return <Spin tip="Loading projects..." />;
  }

  if (projectsError) {
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
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div className="p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Table
            columns={columns}
            dataSource={filteredProjects}
            rowKey="id"
            bordered
            pagination={false}
            scroll={{ x: "100%" }}
            tableLayout="fixed"
            className="rounded-lg"
          />
        </div>
      </div>
    </RoleGuard>
  );
};

export default ProjectInfo;
