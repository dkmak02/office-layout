describe('Project Reservations', () => {

beforeEach(() => {
  cy.visit('/office/floor-7');
 
});
 
it("Should click already taken project desk and verify UI response without DB changes", () => {
  // 1. Wait for and click on the desk
  cy.get('[data-testid="desk-DSK-PROJ-T"]')
    .should('be.visible')
    .click();
 
  // 2. Wait for and open employee select dropdown
  cy.get('[data-testid="employee-select"]')
    .should('be.visible')
    .click()
    .type('USER-0-F');
 
  // 3. Select user from dropdown
  cy.contains('.ant-select-item-option-content', 'USER-0-F USER-0-F')
    .should('be.visible')
    .click();
 
  // 4. Confirm the selection
  cy.contains('span', 'confirm', { matchCase: false })
    .should('be.visible')
    .click();
 
  // 5. Add assertions to verify UI response (optional example)
  cy.get('[data-testid="error-message"]').should('exist').contains('This desk already has a reservation for the selected time period.');
  
  cy.intercept('POST', 'https://localhost:8080/Desks?floor=Floor%207&pointInTime=2025-06-13T10:00:01').as('createReservation');
  cy.wait('@createReservation').then((interception) => {
    const body = interception.response?.body;
    console.log(body);
    //check if desk with name DSK-PROJ-T has reservation for the user USER-0-F
  });
 
  // 6. (Optional) Assert that reservation did NOT persist to DB
  // You'd need an API call or DB check here if applicable.
});

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
