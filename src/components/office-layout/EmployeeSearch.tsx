import { Select } from "antd";
const EmployeeSearch = () => {
    return (
      <Select
        mode="multiple"
        showSearch
        placeholder={"searchEmployee"}
        optionFilterProp="label"
        allowClear
        className="mt-1 mb-1 bg-white px-3 py-1 rounded-md shadow-md overflow-y-auto"
        // options={allEmployees.data?.map((emp: any) => ({
        //   value: emp.id,
        //   label: emp.name + " " + emp.surname,
        // }))}
        style={{
          minWidth: 250,
          flex: 1,
          maxWidth: "50%",
        }}
        maxTagCount={4}
        maxTagTextLength={10}
      />
    );
    }
export default EmployeeSearch;