"use client";
import { useTranslations } from "next-intl";
import { useUtilsByFloor, Utility } from "@/api/queries/utils/utils-api";
import Printer from "@/components/icons/Printer";
import { Tooltip } from "antd";

type GenerateDesksProps = {
  floor: string;
};
const GenerateDesks: React.FC<GenerateDesksProps> = ({ floor }) => {
  const t = useTranslations("Printer");
  const { data: printers, isLoading, isError } = useUtilsByFloor(floor);
  
  if (isLoading) {
    return <text>Loading...</text>;
  }
  if (isError) {
    return <text>Error loading printers</text>;
  }

  return (
    <g>
      {printers?.map((printer: Utility) => (
        <Tooltip
          key={printer.id}
          title={
            <div className="p-3 rounded-lg bg-white min-w-[150px]">
              <div className="flex items-center font-bold text-blue-600 mb-2 border-b border-gray-200 pb-2">
                <span className="text-lg">{t("printer")}</span>
              </div>
              <div className="flex items-center font-semibold text-gray-800">
                <span className="font-bold text-gray-600 flex-1 truncate overflow-hidden whitespace-nowrap max-w-[180px]">{printer.utillNo}</span>
              </div>
            </div>
          }
          mouseEnterDelay={0.1}
          color="white"
        >
          <g>
            <Printer x={printer.width} y={printer.height} x_axis={printer.x_Axis} y_axis={printer.y_Axis} rotation={printer.rotation} />
          </g>
        </Tooltip>
      ))}
    </g>
  );
};
export default GenerateDesks;
