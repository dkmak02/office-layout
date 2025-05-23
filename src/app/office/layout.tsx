import EmployeeSearch from "@/components/office-layout/EmployeeSearch";
import OfficeDatePicker from "@/components/office-layout/OfficeDatePicker";
import Projects from "@/components/sider/Projects";

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-gray-50" style={{ height: "calc(100vh - 64px)" }}>
      <aside
        className="bg-white rounded-lg overflow-y-auto p-2 mr-0 ml-4 my-4 text-black padding-24"
        style={{
          flex: "0 0 300px",
          width: "300px",
          minWidth: "300px",
          maxWidth: "300px",
        }}
      >
        <Projects />
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <div className="flex justify-between items-center gap-4 mt-4 mb-2">
          <EmployeeSearch />
          <OfficeDatePicker />
        </div>
        <div
          style={{
            padding: 24,
            paddingBottom: 48,
            margin: 0,
            background: "white",
            borderRadius: "8px",
          }}
          className="selectable-container flex-1"
        >
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
