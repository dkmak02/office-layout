import EmployeeSearch from "@/components/office-layout/EmployeeSearch";
import OfficeDatePicker from "@/components/office-layout/OfficeDatePicker";

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside
        className="bg-white rounded-lg overflow-y-auto p-2 mr-0 ml-4 my-4 text-black"
        style={{
          flex: "0 0 300px",
          width: "300px",
          minWidth: "300px",
          maxWidth: "300px",
        }}
      >
        sidebar
      </aside>
      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="flex justify-between items-center gap-4 mt-4 mb-2">
          <EmployeeSearch />
          <OfficeDatePicker />
        </div>

        {children}
      </main>
    </div>
  );
}
