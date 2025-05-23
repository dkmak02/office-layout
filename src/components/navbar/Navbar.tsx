import { Menu } from "antd";
const Navbar = () => {
    const items = Array.from({ length: 15 }).map((_, index) => ({
      key: index + 1,
      label: `nav ${index + 1}`,
    }));
    return (
      <header
        className="sticky top-0 z-50 w-full h-16 flex items-center px-6 text-white"
        style={{ backgroundColor: "#001529" }}
      >
        <Menu
          theme="dark"
          className="w-full h-full "
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={items}
          style={{
            height: "64px",
            lineHeight: "64px", 
          }}
        />
      </header>
    );
    }
export default Navbar;