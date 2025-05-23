"use client";
import { useDesks } from "@/api/desk/desks-api";
import { Desk } from "@/models/Desk";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
type GenerateDesksProps = {
  floor: string;
};
const GenerateDesks: React.FC<GenerateDesksProps> = ({ floor }) => {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const formattedDate = dayjs(date)
    .add(1, "hour")
    .format("YYYY-MM-DDTHH:mm:ss");

  const { data: desks, isLoading, isError } = useDesks(floor, formattedDate);
  if (isLoading) {
    return <text>Loading...</text>;
  }
  if (isError) {
    return <text>Error loading desks</text>;
  }
  if (!desks) {
    return <text>No desks found</text>;
  }
  const handleDeskClick = (desk: Desk) => {
    console.log("Desk clicked:", desk);
  };
  const handleDeskHover = (
    event: React.MouseEvent<SVGRectElement>,
    desk: Desk
  ) => {
    console.log("Desk hovered:", desk);
  };
  const handleLeave = (event: React.MouseEvent<SVGRectElement>) => {
    console.log("Mouse left the desk");
  };
  return (
    <g>
      {desks.map((desk: Desk) => {
        return (
          <rect
            key={desk.deskId}
            id={desk.deskId.toString()}
            name={desk.name}
            width={desk.width}
            height={desk.height}
            x={desk.x}
            y={desk.y}
            className="desk"
            style={{ transform: `rotate(${desk.rotation}deg)` }}
            opacity={desk.opacity}
            onClick={() => handleDeskClick(desk)}
            onMouseOver={(event) => {
              handleDeskHover(event, desk);
            }}
            onMouseOut={handleLeave}
            fill={desk.color || "#e0e0e0"}
          ></rect>
        );
      })}
    </g>
  );
};
export default GenerateDesks;
