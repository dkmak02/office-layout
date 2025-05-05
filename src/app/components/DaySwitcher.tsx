import { CalendarOutlined } from "@ant-design/icons";
import { Button, DatePicker, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { useDataContext } from "../util/providers/AppDataContext";
import { QueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
const DaySwitcher = () => {
  const t = useTranslations("DaySwitcher");
  const params = useSearchParams();
  const selectedFloor = params.get("floor")?.includes("8")
    ? "Floor 8"
    : "Floor 7";
  const { setSelectedDate, selectedDate } = useDataContext();
  const queryClient = new QueryClient();
  const handleDayPick = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date.add(1, "hour").format("YYYY-MM-DDTHH:mm:ss"));
      queryClient.invalidateQueries({
        queryKey: [
          "floors",
          selectedFloor,
          date.add(1, "hour").format("YYYY-MM-DDTHH:mm:ss"),
        ],
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-10 mt-1 mb-1 bg-white px-3 py-1 rounded-md shadow-md h-[32px] max-w-[400px] w-full">
      <span className="text-sm text-gray-600 font-medium">{`${t("chooseDate")}:`}</span>

      <DatePicker
        value={dayjs(selectedDate)}
        onChange={handleDayPick}
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

export default DaySwitcher;
