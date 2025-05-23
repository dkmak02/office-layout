"use client";

import { useState, useEffect, useMemo } from "react";
import useEmployees from "../util/api/GetEmployees";
import { Table, Spin, Alert, Layout, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UnassignedEmployee } from "@/app/models/employeeModel";
import { Content } from "antd/es/layout/layout";
import useUser from "@/app/util/api/UserApi";
import { useDataContext } from "../util/providers/AppDataContext";
import { useTranslations } from "next-intl";
import useEmployeesMutaion from "../util/api/Employees";
const { Option } = Select;

const UnassignedEmployees = () => {
  const t = useTranslations("UnassignedEmployee");
  const {
    changeRemoteWorkMutation,
    isLoading,
    changeIgnoreAvailabilityMutation,
  } = useEmployeesMutaion();
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useUser();
  const { selectedDate } = useDataContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const { unassignedEmployees } = useEmployees({ isAdmin, date: selectedDate });
  const allData = unassignedEmployees.data || [];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setIsAdmin(userData.isAdmin || userData.isModerator);
      setLoading(false);
    }
  }, [userData]);

  const [filters, setFilters] = useState<{
    name: string;
    companyName: string[];
    department: string[];
    position: string[];
    remoteWork: string[];
    permanentlyAssigned?: boolean;
    ignoreAvailability?: boolean;
  }>({
    name: "",
    companyName: [],
    department: [],
    position: [],
    remoteWork: [],
    permanentlyAssigned: undefined,
    ignoreAvailability: undefined,
  });

  const handleFilterChange = (key: string, value: any) => {
    console.log("key", key);
    console.log("value", value);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const companyOptions = useMemo(
    () => [...new Set(allData.map((e) => e.companyName))],
    [allData]
  );
  const departmentOptions = useMemo(
    () => [...new Set(allData.map((e) => e.department))],
    [allData]
  );
  const positionOptions = useMemo(
    () => [...new Set(allData.map((e) => e.position))],
    [allData]
  );
  const remoteWorkOptions = [
    { value: "0", label: "0%" },
    { value: "33", label: "33%" },
    { value: "66", label: "66%" },
    { value: "100", label: "100%" },
    { value: "OFF", label: "OFF" },
    { value: "MX", label: "MX" },
    { value: "USA", label: "USA" },
    { value: "DE", label: "DE" },
  ];
  const permaOptions = [
    { value: true, label: t("yes"), key: "yes" },
    { value: false, label: t("no"), key: "no" },
  ];
  const filteredData = allData.filter((employee) => {
    const fullName = `${employee.name} ${employee.surname}`.toLowerCase();
    return (
      fullName.includes(filters.name.toLowerCase()) &&
      (filters.companyName.length === 0 ||
        filters.companyName.includes(employee.companyName)) &&
      (filters.department.length === 0 ||
        filters.department.includes(employee.department)) &&
      (filters.position.length === 0 ||
        filters.position.includes(employee.position)) &&
      (filters.remoteWork.length === 0 ||
        filters.remoteWork.includes(employee.availability)) &&
      (filters.permanentlyAssigned === undefined ||
        filters.permanentlyAssigned === employee.permanentlyAssigned) &&
      (filters.ignoreAvailability === undefined ||
        filters.ignoreAvailability === employee.ignoreAvailability)
    );
  });

  const columnHeaderStyle = {
    display: "block",
    whiteSpace: "normal",
    overflow: "visible",
  } as const;
  const handleOverideHotdesk = async (id: number) => {
    try {
      await changeIgnoreAvailabilityMutation({
        employeeID: id,
      });
    } catch (error) {
      console.error("Error changing employee avability:", error);
    }
  };
  const handleAvailabilityChange = async (id: number, value: string) => {
    try {
      await changeRemoteWorkMutation({
        employeeID: id,
        availability: value,
      });
    } catch (error) {
      console.error("Error changing employee avability:", error);
    }
  };
  const columns: ColumnsType<UnassignedEmployee> = [
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("name")}</div>
          <Input
            size="small"
            placeholder={t("filterName")}
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          />
        </div>
      ),
      render: (_, record) => `${record.name} ${record.surname}`,
      key: "name",
      width: 200,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("company")}</div>
          <Select
            mode="multiple"
            size="small"
            placeholder={t("filterCompany")}
            value={filters.companyName}
            onChange={(value) => handleFilterChange("companyName", value)}
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {companyOptions.map((company) => (
              <Option key={company} value={company}>
                {company}
              </Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "companyName",
      key: "companyName",
      width: 200,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("department")}</div>
          <Select
            mode="multiple"
            size="small"
            placeholder={t("filterDepartment")}
            value={filters.department}
            onChange={(value) => handleFilterChange("department", value)}
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {departmentOptions.map((dept) => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "department",
      key: "department",
      width: 200,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("position")}</div>
          <Select
            mode="multiple"
            size="small"
            placeholder={t("filterPosition")}
            value={filters.position}
            onChange={(value) => handleFilterChange("position", value)}
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {positionOptions.map((pos) => (
              <Option key={pos} value={pos}>
                {pos}
              </Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "position",
      key: "position",
      width: 200,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("remoteWork")}</div>
          <Select
            mode="multiple"
            size="small"
            placeholder={t("filterRemoteWork")}
            value={filters.remoteWork}
            onChange={(value) => handleFilterChange("remoteWork", value)}
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {remoteWorkOptions.map((pos) => (
              <Option key={pos.value} value={pos.value}>
                {pos.label}
              </Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "availability",
      key: "availability",
      render: (value: boolean, record: UnassignedEmployee) => (
        <Select
          size="small"
          value={String(value)}
          onChange={(val) => handleAvailabilityChange(record.id, val)}
          style={{ width: "100%" }}
          disabled={
            record.permanentlyAssigned === true || userData?.isAdmin === false
          }
        >
          {remoteWorkOptions.map((opt) => (
            <Select.Option
              key={String(opt.value)}
              value={String(opt.value)}
              disabled={record.hotdeskReservation === true && opt.value === "0"}
              loading={isLoading}
            >
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      ),
      width: 100,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("overrideHotdesk")}</div>
          <Select
            size="small"
            placeholder={t("fileterHotdeskOveride")}
            value={filters.ignoreAvailability}
            onChange={(value) =>
              handleFilterChange("ignoreAvailability", value)
            }
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {permaOptions.map((pos) => (
              <Option key={pos.key} value={pos.value}>
                {pos.label}
              </Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "ignoreAvailability",
      render: (value: boolean, record: UnassignedEmployee) => (
        <Select
          size="small"
          value={String(value)}
          onChange={(val) => handleOverideHotdesk(record.id)}
          style={{ width: "100%" }}
          disabled={
            userData?.isAdmin === false ||
            record.hotdeskReservation ||
            record.permanentlyAssigned ||
            record.availability === "0"
          }
        >
          {permaOptions.map((opt) => (
            <Select.Option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      ),
      key: "ignoreAvailability",
      width: 100,
      ellipsis: true,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("permamentlyAssigned")}</div>
          <Select
            size="small"
            placeholder={t("filterPermamentlyAssigned")}
            value={filters.permanentlyAssigned}
            onChange={(value) =>
              handleFilterChange("permanentlyAssigned", value)
            }
            style={{ width: "100%", minWidth: 0 }}
            allowClear
          >
            {permaOptions.map((pos) => (
              <Option key={pos.key} value={pos.value}>
                {pos.label}
              </Option>
            ))}
          </Select>
        </div>
      ),
      dataIndex: "permanentlyAssigned",
      render: (_, record) => {
        return record.permanentlyAssigned ? t("yes") : t("no");
      },
      key: "permanentlyAssigned",
      width: 100,
      ellipsis: true,
    },
  ];

  if (unassignedEmployees.isLoading || loading) {
    return <Spin tip="Loading unassigned employees..." />;
  }

  if (unassignedEmployees.isError || userError) {
    return (
      <Alert
        message="Error"
        description="Failed to load employees."
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

export default UnassignedEmployees;
