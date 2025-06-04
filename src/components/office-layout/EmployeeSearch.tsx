"use client";
import { Select } from "antd";
import { useTranslations } from "next-intl";
import {useEmployees} from "@/api/queries/employees/employee-api";
import { useEmployeeSearchContext } from "@/util/providers/EmployeeSearchContext";
const EmployeeSearch = () => {
  const { data: employees } = useEmployees();
  const t = useTranslations("HomePage");
  const { setSelectedEmployees } = useEmployeeSearchContext();
  const handleChange = (value: number[]) => {
    setSelectedEmployees(value);
  };
  return (
    <Select
      mode="multiple"
      showSearch
      placeholder={t("searchEmployee")}
      optionFilterProp="label"
      allowClear
      className="mt-1 mb-1 bg-white px-3 py-1 rounded-md shadow-md overflow-y-auto"
      options={employees?.map((emp: any) => ({
        value: emp.id,
        label: emp.name + " " + emp.surname,
      }))}
      style={{
        minWidth: 250,
        flex: 1,
        maxWidth: "50%",
      }}
      maxTagCount={4}
      maxTagTextLength={10}
      onChange={handleChange}
    />
  );
};
export default EmployeeSearch;
