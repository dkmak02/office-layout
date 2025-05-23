import { Menu } from "antd";
import Link from "next/link";
import { navTabs } from "@/util/nav-bar/nav-config";
const Navbar = () => {
  const tabs = navTabs["moderator"];
  //get selected key from url

  return (
    <header
      className="sticky top-0 z-50 w-full h-16 flex items-center px-6 text-white"
      style={{ backgroundColor: "#001529" }}
    >
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["floor7"]}
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