"use client";

import { useState,useEffect } from "react";
import useEmployees from "../util/api/GetEmployees";
import { Table, Spin, Alert, Layout, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UnassignedEmployee } from "@/app/models/employeeModel";
import { Content } from "antd/es/layout/layout";
import useUser from "@/app/util/api/UserApi";

const UnassignedEmployees = () => {
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useUser(); 
      const [isAdmin, setIsAdmin] = useState(false);
  const { unassignedEmployees } = useEmployees({ isAdmin });
  const allData = unassignedEmployees.data || [];
    const [loading, setLoading] = useState(true);

useEffect(() => {
  if (userData) {
    setIsAdmin(userData.isAdmin);
    setLoading(false); 
  }
}, [userData]);
 if (userLoading || unassignedEmployees.isLoading || loading) {
   return <Spin tip="Loading data..." />;
 }

 if (userError || unassignedEmployees.isError) {
   return (
     <Alert
       message="Error"
       description="Failed to load data."
       type="error"
       showIcon
     />
   );
 }

 if (!isAdmin) {
   return <div>You do not have permission to view this page.</div>;
 }
  const [filters, setFilters] = useState({
    name: "",
    companyName: "",
    department: "",
    position: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = allData.filter((employee) => {
    const fullName = `${employee.name} ${employee.surname}`.toLowerCase();
    return (
      fullName.includes(filters.name.toLowerCase()) &&
      employee.companyName
        .toLowerCase()
        .includes(filters.companyName.toLowerCase()) &&
      employee.department
        .toLowerCase()
        .includes(filters.department.toLowerCase()) &&
      employee.position.toLowerCase().includes(filters.position.toLowerCase())
    );
  });

  const columns: ColumnsType<UnassignedEmployee> = [
    {
      title: (
        <div>
          <div>Name</div>
          <Input
            size="small"
            placeholder="Search name"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
        </div>
      ),
      render: (_, record) => `${record.name} ${record.surname}`,
      key: "name",
    },
    {
      title: (
        <div>
          <div>Company</div>
          <Input
            size="small"
            placeholder="Search company"
            value={filters.companyName}
            onChange={(e) => handleFilterChange("companyName", e.target.value)}
          />
        </div>
      ),
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: (
        <div>
          <div>Department</div>
          <Input
            size="small"
            placeholder="Search department"
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
          />
        </div>
      ),
      dataIndex: "department",
      key: "department",
    },
    {
      title: (
        <div>
          <div>Position</div>
          <Input
            size="small"
            placeholder="Search position"
            value={filters.position}
            onChange={(e) => handleFilterChange("position", e.target.value)}
          />
        </div>
      ),
      dataIndex: "position",
      key: "position",
    },
  ];

  if (unassignedEmployees.isLoading) {
    return <Spin tip="Loading unassigned employees..." />;
  }

  if (unassignedEmployees.isError) {
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
              scroll={{ x: true }}
              className="rounded-lg"
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default UnassignedEmployees;
