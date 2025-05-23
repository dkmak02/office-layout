const GenerateDesks  = () =>{
    return (    
    <g>
        {/* {desks.map((desk: Desk) => {
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
        })} */}
      </g>
      )

}
export default GenerateDesks;