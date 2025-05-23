"use client";

import { DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const OfficeDatePicker = () => {
  const t = useTranslations("DaySwitcher");
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const handleDayPick = (date: Dayjs | null) => {
    if (!date) return;

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("date", date.format("YYYY-MM-DD"));
    router.push(`?${current.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-10 mt-1 mb-1 bg-white px-3 py-1 rounded-md shadow-md h-[32px] max-w-[400px] w-full">
      <span className="text-sm text-gray-600 font-medium">{`${t(
        "chooseDate"
      )}:`}</span>

      <DatePicker
        onChange={handleDayPick}
        suffixIcon={<CalendarOutlined />}
        defaultValue={date ? dayjs(date) : dayjs()}
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
