import { Menu } from "antd";
import { NavbarMenuProps } from "@/app/models/componentsModels";

const NavbarMenu: React.FC<NavbarMenuProps> = ({ handleFloorChange }) => {
  const floorsData = [
    { key: "Floor 7", label: "Floor 7" },
    { key: "Floor 8", label: "Floor 8" },
  ];

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={["Floor 7"]}
      items={floorsData}
      style={{ flex: 1, minWidth: 0 }}
      onClick={(e) => handleFloorChange(e.key)}
    />
  );
};

export default NavbarMenu;
