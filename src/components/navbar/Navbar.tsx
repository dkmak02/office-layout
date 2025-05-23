"use client";
import { Menu } from "antd";
import Link from "next/link";
import { navTabs } from "@/util/nav-bar/nav-config";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const tabs = navTabs["moderator"];
  const pathname = usePathname();
  const selectedKey =
    tabs.find((tab) => pathname.startsWith(tab.href))?.key || tabs[0].key;

  return (
    <header
      className="sticky top-0 z-50 w-full h-16 flex items-center px-6 text-white"
      style={{ backgroundColor: "#001529" }}
    >
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[selectedKey]}
        style={{ width: "100%", height: "64px", lineHeight: "64px" }}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: <Link href={tab.href}>{tab.label}</Link>,
        }))}
      />
    </header>
  );
};
export default Navbar;
