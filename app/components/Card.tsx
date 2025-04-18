// import { Card, Timeline, Button } from "antd";
// import dayjs from "dayjs";
// import { Reservation } from "../models/deskModel";
// const deleteReservation = async () => {
//   const genterateCard = (reservation: Reservation) => {
//     const startDate = dayjs(reservation.startTime).format("YYYY-MM-DD");
//     const endDate =
//       dayjs(reservation.endTime).year() === 9999
//         ? "Brak daty zakończenia"
//         : dayjs(reservation.endTime).format("YYYY-MM-DD");

//     return (
//       <Card
//         key={reservation.reservationID}
//         title={`Rezerwacja: ${deskName}`}
//         variant="outlined"
//         style={{ marginTop: 16 }}
//       >
//         <Timeline
//           style={{ padding: 0, margin: 0 }}
//           items={[
//             {
//               children: reservation.userName,
//             },
//             {
//               dot: <ClockCircleOutlined className="timeline-clock-icon" />,
//               color: "red",
//               children: startDate + " / " + endDate,
//               style: { padding: 0, margin: 0 },
//             },
//           ]}
//         />
//         {validateRoles() && (
//           <Button
//             danger
//             onClick={() => handleCardUnreserv(reservation.reservationID)}
//             style={{ margin: 0 }}
//           >
//             Usuń rezerwację
//           </Button>
//         )}
//       </Card>
//     );
//   };
// };
// export default deleteReservation;
