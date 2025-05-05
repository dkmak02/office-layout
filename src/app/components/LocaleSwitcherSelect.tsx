"use client";

import { Select, Spin } from "antd";
import { useTransition } from "react";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Select
        defaultValue={defaultValue}
        onChange={handleChange}
        loading={isPending}
        style={{ width: 120, marginRight: 20 }}
        aria-label={label}
      >
        {items.map((item) => (
          <Select.Option key={item.value} value={item.value}>
            {item.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}
