describe('Project Reservations', () => {
  let testDeskId: string;
  let testEmployeeId: number;
  let testProjectId: number;
  let testReservationId: number;

  before(() => {
    // Get test data before running tests
    cy.getDesks('Floor 7', '2025-06-13T00:00:01').then((response) => {
      expect(response.status).to.eq(200);
      console.log(response.body);
      testDeskId = response.body[0].id;
    });

    cy.getEmployees().then((response) => {
      expect(response.status).to.eq(200);
      testEmployeeId = response.body[0].id;
    });

    cy.getProjects('Floor 7', '2025-06-13T00:00:01').then((response) => {
      expect(response.status).to.eq(200);
      testProjectId = response.body[0].id;
    });
  });

//   beforeEach(() => {
//     // Clean up any existing reservations before each test
//     cy.getCurrentUser().then((response) => {
//       expect(response.status).to.eq(200);
//       // Add cleanup logic if needed
//     });
//   });

//   it('should successfully create a project desk reservation', () => {
//     cy.reserveProjectDesk(testDeskId, testEmployeeId).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('id');
//       testReservationId = response.body.id;
//     });
//   });

//   it('should fail to create a project desk reservation with invalid desk ID', () => {
//     cy.reserveProjectDesk('invalid-desk-id', testEmployeeId).then((response) => {
//       expect(response.status).to.not.eq(200);
//     });
//   });

//   it('should fail to create a project desk reservation with invalid employee ID', () => {
//     cy.reserveProjectDesk(testDeskId, 999999).then((response) => {
//       expect(response.status).to.not.eq(200);
//     });
//   });

//   it('should successfully delete a project desk reservation', () => {
//     // First create a reservation
//     cy.reserveProjectDesk(testDeskId, testEmployeeId).then((response) => {
//       expect(response.status).to.eq(200);
//       const reservationId = response.body.id;

//       // Then delete it
//       cy.deleteReservation(reservationId).then((deleteResponse) => {
//         expect(deleteResponse.status).to.eq(200);
//       });
//     });
//   });

//   it('should fail to delete a non-existent reservation', () => {
//     cy.deleteReservation(999999).then((response) => {
//       expect(response.status).to.not.eq(200);
//     });
//   });

//   it('should verify desk is available after reservation is deleted', () => {
//     // Create a reservation
//     cy.reserveProjectDesk(testDeskId, testEmployeeId).then((response) => {
//       expect(response.status).to.eq(200);
//       const reservationId = response.body.id;

//       // Delete the reservation
//       cy.deleteReservation(reservationId).then((deleteResponse) => {
//         expect(deleteResponse.status).to.eq(200);

//         // Verify the desk is available again
//         cy.getDesks().then((desksResponse) => {
//           expect(desksResponse.status).to.eq(200);
//           const desk = desksResponse.body.find((d: any) => d.id === testDeskId);
//           expect(desk).to.exist;
//           expect(desk.isAvailable).to.be.true;
//         });
//       });
//     });
//   });

//   it('should not allow multiple reservations for the same desk', () => {
//     // Create first reservation
//     cy.reserveProjectDesk(testDeskId, testEmployeeId).then((response) => {
//       expect(response.status).to.eq(200);
//       const firstReservationId = response.body.id;

//       // Try to create second reservation for the same desk
//       cy.reserveProjectDesk(testDeskId, testEmployeeId).then((secondResponse) => {
//         expect(secondResponse.status).to.not.eq(200);

//         // Clean up
//         cy.deleteReservation(firstReservationId);
//       });
//     });
//   });

//   it('should verify project desk reservation in logs', () => {
//     // Create a reservation
//     cy.reserveProjectDesk(testDeskId, testEmployeeId).then((response) => {
//       expect(response.status).to.eq(200);
//       const reservationId = response.body.id;

//       // Check logs for the reservation
//       cy.getLogs(1, 10).then((logsResponse) => {
//         expect(logsResponse.status).to.eq(200);
//         const logs = logsResponse.body;
//         const reservationLog = logs.find((log: any) => 
//           log.reservationId === reservationId && 
//           log.action === 'CREATE' && 
//           log.deskId === testDeskId
//         );
//         expect(reservationLog).to.exist;

//         // Clean up
//         cy.deleteReservation(reservationId);
//       });
//     });
//   });

//   after(() => {
//     // Clean up any remaining test data
//     if (testReservationId) {
//       cy.deleteReservation(testReservationId);
//     }
//   });
});
