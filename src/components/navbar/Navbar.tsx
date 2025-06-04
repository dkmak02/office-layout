"use client";
import { Menu, Button } from "antd";
import Link from "next/link";
import { navTabs } from "@/util/nav-bar/nav-config";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/api/queries/auth/get-user";
import { UserRole } from "@/util/nav-bar/nav-config";
import LocaleSwitcher from "./LocaleSwitcher";

const Navbar = () => {
  const t = useTranslations("NavbarMenu");
  const { data: user } = useUser();
  let role: UserRole = "employee";
  if (user?.isAdmin || user?.isModerator) {
    role = "moderator";
  }
  const tabs = navTabs[role];
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const date = searchParams.get("date");

  const selectedKey =
    tabs.find((tab: { key: string; label: string; href: string }) => pathname.startsWith(tab.href))?.key || tabs[0].key;

  return (
    <header
      className="sticky top-0 z-50 w-full h-16 flex items-center px-6 text-white"
      style={{ backgroundColor: "#001529" }}
    >
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <div style={{ flex: 1 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            style={{ width: "100%", height: "64px", lineHeight: "64px" }}
            items={tabs.map((tab: { key: string; label: string; href: string }) => {
              const hrefWithDate = date
                ? `${tab.href}?date=${encodeURIComponent(date)}`
                : tab.href;

              return {
                key: tab.key,
                label: <Link href={hrefWithDate}>{t(tab.label)}</Link>,
              };
            })}
          />
        </div>
        <LocaleSwitcher />
        {user && (
          <Button
            type="primary"
            style={{   height: "64px", lineHeight: "64px", borderRadius: "0px" }}
          >
            {user.name} {user.surname}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
