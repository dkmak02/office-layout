"use client";
import { Table, Input, Button, Space, Spin, Alert, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React, { useRef, useState } from "react";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { InputRef } from "antd";
import { useEmployeesInfo } from "@/api/queries/employees/employee-api";
import { useProjectOptionValues } from "@/api/queries/project/project-api";
import type { EmployeeInfo } from "@/models/Employee";
import type { Key } from "react";
import { useTranslations } from "next-intl";

type DataIndex = keyof EmployeeInfo;

const getColumnSearchProps = (
  dataIndex: DataIndex,
  searchInput: React.RefObject<InputRef | null>,
  searchText: string,
  setSearchText: (text: string) => void,
  searchedColumn: string,
  setSearchedColumn: (col: string) => void
): ColumnType<EmployeeInfo> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        ref={searchInput}
        placeholder={`Search ${dataIndex}`}
        value={selectedKeys[0] as string}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() =>
          handleSearch(
            selectedKeys as string[],
            confirm,
            dataIndex,
            setSearchText,
            setSearchedColumn
          )
        }
        style={{ marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() =>
            handleSearch(
              selectedKeys as string[],
              confirm,
              dataIndex,
              setSearchText,
              setSearchedColumn
            )
          }
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters, setSearchText)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
  onFilter: (value, record) =>
    record[dataIndex]
      ? record[dataIndex]!.toString().toLowerCase().includes((value as string).toLowerCase())
      : false,
  onFilterDropdownOpenChange: (visible) => {
    if (visible) {
      setTimeout(() => searchInput.current?.select(), 100);
    }
  },
  render: (text: any) =>
    searchedColumn === dataIndex ? (
      <span style={{ backgroundColor: "#ffc069", padding: 0 }}>{text}</span>
    ) : (
      text
    ),
});

function handleSearch(
  selectedKeys: string[],
  confirm: () => void,
  dataIndex: string,
  setSearchText: (text: string) => void,
  setSearchedColumn: (col: string) => void
) {
  confirm();
  setSearchText(selectedKeys[0] as string);
  setSearchedColumn(dataIndex);
}

function handleReset(
  clearFilters: (() => void) | undefined,
  setSearchText: (text: string) => void
) {
  clearFilters && clearFilters();
  setSearchText("");
}

export default function EmployeesPage() {
  const { data, isLoading, isError, error } = useEmployeesInfo();
  const { data: availabilityOptions, isLoading: isLoadingAvailability } = useProjectOptionValues();

  const [filters, setFilters] = useState<{
    name: string;
    companyName: string;
    department: string;
    position: string;
    permanentlyAssigned: string;
    availability: string;
    hotdeskReservation: string;
    ignoreAvailability: string;
  }>({
    name: "",
    companyName: "",
    department: "",
    position: "",
    permanentlyAssigned: "",
    availability: "",
    hotdeskReservation: "",
    ignoreAvailability: "",
  });
  const t = useTranslations ? useTranslations("EmployeesInfo") : (x: string) => x;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const columnHeaderStyle: React.CSSProperties = { display: "flex", flexDirection: "column", rowGap: 4 };
  const companyOptions = Array.from(new Set((data || []).map((r) => r.companyName))).filter(Boolean);
  const departmentOptions = Array.from(new Set((data || []).map((r) => r.department))).filter(Boolean);
  const positionOptions = Array.from(new Set((data || []).map((r) => r.position))).filter(Boolean);

  const columns: ColumnsType<EmployeeInfo> = [
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
            allowClear
            showSearch
            placeholder={t("filterCompany")}
            value={filters.companyName || undefined}
            onChange={(value) => handleFilterChange("companyName", value || "")}
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
            allowClear
            showSearch
            placeholder={t("filterDepartment")}
            value={filters.department || undefined}
            onChange={(value) => handleFilterChange("department", value || "")}
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
            allowClear
            showSearch
            placeholder={t("filterPosition")}
            value={filters.position || undefined}
            onChange={(value) => handleFilterChange("position", value || "")}
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
      render: (value: string) =>
        !isNaN(Number(value)) && value.trim() !== '' ? `${value}%` : value,
    },
    
    {
      title: (
        <div style={columnHeaderStyle}>
          <div>{t("overrideHotdesk")}</div>
          <Select
            size="small"
            allowClear
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
      render: (value: boolean) => (value ? t("yes") : t("no")),
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
    if (filters.companyName && record.companyName !== filters.companyName) {
      return false;
    }
    if (filters.department && record.department !== filters.department) {
      return false;
    }
    if (filters.position && record.position !== filters.position) {
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
    <div style={{ padding: 24 }}>
      <Table columns={columns} dataSource={filteredData} rowKey="id" bordered  pagination={false}/>
    </div>
  );
}
