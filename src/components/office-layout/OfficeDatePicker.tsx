"use client";
import { DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
const OfficeDatePicker = () => {
    return (
      <div className="flex items-center justify-between gap-10 mt-1 mb-1 bg-white px-3 py-1 rounded-md shadow-md h-[32px] max-w-[400px] w-full">
        <span className="text-sm text-gray-600 font-medium">{`${
          "chooseDate"
        }:`}</span>

        <DatePicker
        //   value={dayjs(selectedDate)}
        //   onChange={handleDayPick}
          suffixIcon={<CalendarOutlined />}
          size="small"
          className="ml-2 w-50"
          allowClear={false}
          format="YYYY-MM-DD"
          disabledDate={(current) => current < dayjs().startOf("day")}
        />
      </div>
    );
    };
export default OfficeDatePicker;