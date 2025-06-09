"use client";
import React, { useState } from "react";
import { Table, Pagination, Card, Tag, Typography, Alert, Spin, Space, Collapse } from "antd";
import { useTranslations } from "next-intl";
import { useUser } from "@/api/queries/auth/get-user";
import { useLogs } from "@/api/queries/logs/logs-api";
import { LogResponse, LogEntry } from "@/models/Log";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const LogsPage: React.FC = () => {
  const t = useTranslations("NavbarMenu");
  const tLogs = useTranslations("Logs");
  const { data: user, isLoading: userLoading } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: logs, isLoading: logsLoading, error } = useLogs(currentPage, pageSize);

  // Check if user is admin or moderator
  const isAuthorized = user?.isAdmin || user?.isModerator;

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <Alert
          message={tLogs("accessDenied")}
          description={tLogs("accessDeniedDescription")}
          type="error"
          showIcon
        />
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "red";
      case "warning":
        return "orange";
      case "information":
      case "info":
        return "blue";
      case "debug":
        return "purple";
      default:
        return "default";
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  const expandedRowRender = (record: LogResponse) => {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <Space direction="vertical" className="w-full">
          {record.logs.map((log: LogEntry, index: number) => (
            <Card
              key={index}
              size="small"
              className="mb-2"
              style={{
                borderLeft: `4px solid ${
                  log.level.toLowerCase() === "error"
                    ? "#ff4d4f"
                    : log.level.toLowerCase() === "warning"
                    ? "#faad14"
                    : "#1890ff"
                }`,
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag color={getLevelColor(log.level)}>{log.level}</Tag>
                    <Text type="secondary" className="text-sm">
                      {dayjs(log.timeStamp).format("YYYY-MM-DD HH:mm:ss")}
                    </Text>
                  </div>
                  <Text className="font-mono text-sm">{log.message}</Text>
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </div>
    );
  };

  const columns = [
    {
      title: tLogs("clientUsername"),
      dataIndex: "client_Username",
      key: "client_Username",
      render: (username: string | null) => username || <Text type="secondary">{tLogs("notAvailable")}</Text>,
    },
    {
      title: tLogs("status"),
      dataIndex: "isSuccess",
      key: "isSuccess",
      render: (isSuccess: boolean) => (
        <Tag color={isSuccess ? "green" : "red"}>
          {isSuccess ? tLogs("success") : tLogs("failed")}
        </Tag>
      ),
    },
    {
      title: tLogs("logCount"),
      key: "logCount",
      render: (record: LogResponse) => record.logs.length,
    },
    {
      title: tLogs("latestTimestamp"),
      key: "latestTimestamp",
      render: (record: LogResponse) => {
        const latest = record.logs.reduce((latest, current) =>
          dayjs(current.timeStamp).isAfter(dayjs(latest.timeStamp)) ? current : latest
        );
        return dayjs(latest.timeStamp).format("YYYY-MM-DD HH:mm:ss");
      },
    },
  ];

  return (
    <div className="container mx-auto p-6">

      {error && (
        <Alert
          message={tLogs("errorLoadingLogs")}
          description={tLogs("errorLoadingDescription")}
          type="error"
          className="mb-4"
        />
      )}

      <Card>
        <Table
          dataSource={logs}
          columns={columns}
          loading={logsLoading}
          pagination={false}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.logs.length > 0,
          }}
          rowKey={(record, index) => index?.toString() || "0"}
          scroll={{ x: true }}
        />

        <div className="flex justify-center mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={currentPage * pageSize + (logs && logs.length === pageSize ? pageSize : 0)}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      </Card>
    </div>
  );
};

export default LogsPage; 