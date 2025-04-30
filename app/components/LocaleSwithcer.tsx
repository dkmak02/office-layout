"use client";

import { usePathname, useRouter } from "next/navigation";
import { Select } from "antd";
import { useEffect, useState } from "react";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState("en");

  useEffect(() => {
    const localeFromPath = pathname.split("/")[1];
    if (["en", "pl"].includes(localeFromPath)) {
      setCurrentLocale(localeFromPath);
    }
  }, [pathname]);

  const handleChange = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|pl)/, "");
    const normalizedPath = pathWithoutLocale || "/";
    router.push(`/${newLocale}${normalizedPath}`);
  };

  return (
    <Select
      value={currentLocale}
      onChange={handleChange}
      style={{ width: 120, marginRight: 20 }}
      options={[
        { value: "en", label: "English" },
        { value: "pl", label: "Polski" },
      ]}
    />
  );
}
