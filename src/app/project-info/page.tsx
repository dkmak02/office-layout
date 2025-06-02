"use client";
import { Table, Spin, Alert, Layout } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Content } from "antd/es/layout/layout";
import { useTranslations } from "next-intl";
import { Project } from "@/models/Project";
import {useProjectInfo} from "@/api/queries/project/project-api-page";
import RoleGuard from "@/components/auth/RoleGuard";

const ProjectInfo = () => {
  const t = useTranslations("ProjectInfo");
  const { data: allProjects, isLoading: projectsLoading, isError: projectsError } = useProjectInfo();

  const columns: ColumnsType<Project> = [
    {
      title: t("code"),
      dataIndex: "code",
      key: "code",
      width: 125,
      ellipsis: true,
    },
    {
      title: t("description"),
      dataIndex: "name",
      key: "name",
      width: 300,
      ellipsis: true,
    },
    {
      title: t("visibility"),
      dataIndex: "visibility",
      key: "visibility",
      width: 100,
      ellipsis: true,
      render: (value: boolean) => (value ? t("visible") : t("hidden")),
    },
    {
      title: t("color"),
      dataIndex: "color",
      key: "color",
      width: 120,
      render: (color: string) => (
        <div
          style={{
            width: 40,
            height: 40,
            backgroundColor: color || "#ccc",
            border: "1px solid #999",
            borderRadius: 6,
            display: "inline-block",
          }}
        />
      ),
    },
  ];

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
      <Layout className="min-h-screen bg-gray-100">
        <Content className="p-8 flex flex-col h-full">
          <div className="flex flex-col flex-grow bg-white p-6 rounded-lg shadow-md min-h-[calc(100vh-64px-4rem)]">
            <div className="flex-grow">
              <Table
                columns={columns}
                dataSource={allProjects}
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
    </RoleGuard>
  );
};

export default ProjectInfo;
