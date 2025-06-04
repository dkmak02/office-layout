"use client";
import { Table, Input, Button, Space, Spin, Alert, Select } from "antd";
import React, { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {useEmployees} from "@/api/queries/employees/employee-api";
import { useProjectOptionValues } from "@/api/queries/project/project-api-floor-date";
import type { Employee } from "@/models/Employee";
import { useTranslations } from "next-intl";
import RoleGuard  from "@/components/auth/RoleGuard";
import { useUser } from "@/api/queries/auth/get-user";

export default function EmployeesPage() {
  const { data, isLoading, isError, error } = useEmployees();
  const { data: availabilityOptions, isLoading: isLoadingAvailability } = useProjectOptionValues();
  const { data: user } = useUser();
  const isAdmin = user?.isAdmin;

  const [filters, setFilters] = useState<{
    name: string;
    companyName: string[];
    department: string[];
    position: string[];
    permanentlyAssigned: string;
    availability: string;
    hotdeskReservation: string;
    ignoreAvailability: string;
  }>({
    name: "",
    companyName: [],
    department: [],
    position: [],
    permanentlyAssigned: "",
    availability: "",
    hotdeskReservation: "",
    ignoreAvailability: "",
  });
  const t = useTranslations ? useTranslations("EmployeesInfo") : (x: string) => x;

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const columnHeaderStyle: React.CSSProperties = { display: "flex", flexDirection: "column", rowGap: 4 };
  const companyOptions = Array.from(new Set((data || []).map((r) => r.companyName))).filter(Boolean);
  const departmentOptions = Array.from(new Set((data || []).map((r) => r.department))).filter(Boolean);
  const positionOptions = Array.from(new Set((data || []).map((r) => r.position))).filter(Boolean);

  const [availabilityMap, setAvailabilityMap] = useState<Record<number, string>>({});
  const [hotdeskMap, setHotdeskMap] = useState<Record<number, string>>({});

  const columns: ColumnsType<Employee> = [
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t ? t("name") : "Full Name"}</div>
          <Input
            size="small"
            placeholder={t ? t("filterName") : "Filter name or surname"}
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
            size="small"
            mode="multiple"
            allowClear
            showSearch
            placeholder={t("filterCompany")}
            value={filters.companyName}
            onChange={(value) => handleFilterChange("companyName", value)}
            style={{ width: "100%", minWidth: 0 }}
            options={companyOptions.map((opt) => ({ value: opt, label: opt }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
      ),
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("department")}</div>
          <Select
            size="small"
            mode="multiple"
            allowClear
            showSearch
            placeholder={t("filterDepartment")}
            value={filters.department}
            onChange={(value) => handleFilterChange("department", value)}
            style={{ width: "100%", minWidth: 0 }}
            options={departmentOptions.map((opt) => ({ value: opt, label: opt }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
      ),
      dataIndex: "department",
      key: "department"
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("position")}</div>
          <Select
            size="small"
            mode="multiple"
            allowClear
            showSearch
            placeholder={t("filterPosition")}
            value={filters.position}
            onChange={(value) => handleFilterChange("position", value)}
            style={{ width: "100%", minWidth: 0 }}
            options={positionOptions.map((opt) => ({ value: opt, label: opt }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
      ),
      dataIndex: "position",
      key: "position"
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("remoteWork")}</div>
          <Select
            size="small"
            allowClear
            showSearch
            placeholder={t("filterRemoteWork")}
            value={filters.availability || undefined}
            onChange={(value) => handleFilterChange("availability", value || "")}
            style={{ width: "100%", minWidth: 0 }}
            options={
              availabilityOptions
                ? availabilityOptions.map((opt: string) => ({
                    value: opt,
                    label: !isNaN(Number(opt)) && opt.trim() !== '' ? `${opt}%` : opt
                  }))
                : []
            }
            loading={isLoadingAvailability}
          />
        </div>
      ),
      dataIndex: "availability",
      key: "availability",
      ellipsis: true,
      width: 150,
      render: (value: string, record: Employee) => (
        <Select
          size="small"
          showSearch
          disabled={!isAdmin || record.permanentlyAssigned}
          value={availabilityMap[record.id] !== undefined ? availabilityMap[record.id] : value}
          onChange={(val) => setAvailabilityMap((prev) => ({ ...prev, [record.id]: val }))}
          style={{ width: "100%" }}
          options={
            availabilityOptions
              ? availabilityOptions.map((opt: string) => ({
                  value: opt,
                  label: !isNaN(Number(opt)) && opt.trim() !== '' ? `${opt}%` : opt,
                  disabled: opt === '0' && record.hotdeskReservation
                }))
              : []
          }
          loading={isLoadingAvailability}
        />
      ),
    },
    
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("overrideHotdesk")}</div>
          <Select
            size="small"
            allowClear
            showSearch
            placeholder={t("fileterHotdeskOveride")}
            value={filters.hotdeskReservation || undefined}
            onChange={(value) => handleFilterChange("hotdeskReservation", value || "")}
            style={{ width: "100%", minWidth: 0 }}
            options={[
              { value: "true", label: t("yes") },
              { value: "false", label: t("no") },
            ]}
          />
        </div>
      ),
      dataIndex: "hotdeskReservation",
      key: "hotdeskReservation",
      render: (value: boolean, record: Employee) => (
        <Select
          size="small"
          showSearch
          disabled={!isAdmin || record.permanentlyAssigned || record.hotdeskReservation || record.availability === "0"}
          value={hotdeskMap[record.id] !== undefined ? hotdeskMap[record.id] : String(value)}
          onChange={(val) => setHotdeskMap((prev) => ({ ...prev, [record.id]: val }))}
          style={{ width: "100%" }}
          options={[
            { value: "true", label: t("yes") },
            { value: "false", label: t("no") },
          ]}
        />
      ),
      ellipsis: true,
      width: 150,
    },
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("permamentlyAssigned")}</div>
          <Select
            size="small"
            allowClear
            placeholder={t("filterPermamentlyAssigned")}
            value={filters.permanentlyAssigned || undefined}
            onChange={(value) => handleFilterChange("permanentlyAssigned", value || "")}
            style={{ width: "100%", minWidth: 0 }}
            options={[
              { value: "true", label: t("yes") },
              { value: "false", label: t("no") },
            ]}
          />
        </div>
      ),
      dataIndex: "permanentlyAssigned",
      key: "permanentlyAssigned",
      render: (value: boolean) => (value ? t("yes") : t("no")),
      ellipsis: true,
      width: 175,
    },
  ];

  const filteredData = data?.filter((record) => {
    const nameFilter = filters.name.trim().toLowerCase();
    if (nameFilter && !(`${record.name} ${record.surname}`.toLowerCase().includes(nameFilter))) {
      return false;
    }
    if (filters.companyName.length > 0 && !filters.companyName.includes(record.companyName)) {
      return false;
    }
    if (filters.department.length > 0 && !filters.department.includes(record.department)) {
      return false;
    }
    if (filters.position.length > 0 && !filters.position.includes(record.position)) {
      return false;
    }
    if (filters.permanentlyAssigned) {
      const val = filters.permanentlyAssigned.toLowerCase();
      if (val === "true" && !record.permanentlyAssigned) return false;
      if (val === "false" && record.permanentlyAssigned) return false;
    }
    if (filters.availability && record.availability !== filters.availability) {
      return false;
    }
    if (filters.hotdeskReservation) {
      if (filters.hotdeskReservation === "true" && !record.hotdeskReservation) return false;
      if (filters.hotdeskReservation === "false" && record.hotdeskReservation) return false;
    }
    if (filters.ignoreAvailability) {
      if (filters.ignoreAvailability === "true" && !record.ignoreAvailability) return false;
      if (filters.ignoreAvailability === "false" && record.ignoreAvailability) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Error" description={error?.message || "Failed to load employees info."} type="error" showIcon />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div style={{ padding: 24 }}>
        <Table columns={columns} dataSource={filteredData} rowKey="id" bordered  pagination={false}/>
      </div>
    </RoleGuard>
  );
}
