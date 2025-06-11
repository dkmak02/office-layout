describe('Office Layout E2E Tests', () => {
  beforeEach(() => {
    // Mock API responses for consistent testing
    cy.intercept('GET', '**/Employees/Auth', {
      fixture: 'employee.json'
    }).as('getEmployee')
    
    cy.intercept('GET', '**/Desks*', {
      fixture: 'desks.json'
    }).as('getDesks')
    
    cy.intercept('GET', '**/Projects*', {
      fixture: 'projects.json'
    }).as('getProjects')
    
    cy.intercept('GET', '**/Employees', {
      fixture: 'employees.json'
    }).as('getEmployees')
  })

  describe('Employee Authentication and Navigation', () => {
    it('should authenticate via Kerberos and navigate to office layout and display projects, desks, employees, locale and user reservations', () => {
      // Visit the root URL - should redirect to office layout with today's date
      cy.visit('/')
      
      // Wait for authentication check to complete
      cy.wait('@getEmployee')
      cy.wait('@getDesks')
      cy.wait('@getProjects')
      
      // Should be redirected to office layout with date parameter
      cy.url().should('include', '/office/floor-7')
      cy.url().should('include', 'date=')
      
      // Check that all main components are visible
      // 1. Projects list
      cy.get('[data-testid="projects-list"]').should('be.visible')
      
      // 2. Desks container
      cy.get('[data-testid="desks-container"]').should('be.visible')
      
      // 3. Employee search
      cy.get('[data-testid="employee-search"]').should('be.visible')
      
      // 4. Locale switcher
      cy.get('[data-testid="locale-switcher"]').should('be.visible')
      
      // 5. User reservations dropdown
      cy.get('[data-testid="user-reservations-dropdown"]').should('be.visible')
      
      // 6. Office date picker
      cy.get('[data-testid="office-date-picker"]').should('be.visible')
      
    })
    it('should display navbar with user info', () => {
      cy.visit('/office/floor-7')
      cy.wait('@getEmployee')
      
      // Check navbar elements
      cy.get('[data-testid="user-reservations-dropdown"]')
        .should('be.visible')
        .and('contain', 'Dawid Kmak')

      //check if after clicking on user reservations dropdown, the dropdown is visible
      cy.get('[data-testid="user-reservations-dropdown"]').click()
      cy.get('[data-testid="user-reservations-dropdown"]').should('be.visible')
      
    })

    it('should handle authentication failure when Kerberos auth fails', () => {
      // Mock authentication failure
      cy.intercept('GET', '**/Employees/Auth', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('getAuthFailure')
      
      cy.visit('/office')
      cy.wait('@getAuthFailure')
      
      // Should show error message from ClientAuthGuard
      cy.contains('Not authorized').should('be.visible')
      cy.contains('You must be authenticated to access this application').should('be.visible')
    })
  })

//   describe('User Reservations Dropdown', () => {
//     beforeEach(() => {
//       // Mock user with existing reservations
//       cy.intercept('GET', '**/Employees/Auth', {
//         body: {
//           id: 13439,
//           name: 'Dawid',
//           surname: 'Kmak',
//           isAdmin: false,
//           isModerator: false,
//           reservations: [
//             {
//               reservationID: 2522,
//               startTime: '2025-06-11T00:00:00',
//               endTime: '2025-06-11T23:59:00',
//               deskNo: 'DSK7006'
//             },
//             {
//               reservationID: 2523,
//               startTime: '2025-06-10T00:00:00',
//               endTime: '2025-06-10T23:59:00',
//               deskNo: 'DSK7009'
//             }
//           ]
//         }
//       }).as('getUserWithReservations')
      
//       cy.visit('/office/floor-7')
//       cy.wait('@getUserWithReservations')
//     })

//     it('should display user reservations in dropdown', () => {
//       // Click on user dropdown
//       cy.get('[data-testid="user-reservations-dropdown"]').click()
      
//       // Should see reservations
//       cy.get('.ant-dropdown').should('be.visible')
//       cy.contains('My Reservations').should('be.visible')
//       cy.contains('DSK7006').should('be.visible')
//       cy.contains('DSK7009').should('be.visible')
//     })

//     it('should show delete buttons for hotdesk reservations', () => {
//       // Click on user dropdown
//       cy.get('[data-testid="user-reservations-dropdown"]').click()
      
//       // Should see delete buttons for hotdesk reservations (ones with endTime)
//       cy.get('[data-testid="delete-reservation-button"]').should('have.length', 2)
//     })

//     it('should successfully delete a hotdesk reservation', () => {
//       // Mock successful deletion
//       cy.intercept('DELETE', '**/Reservations/Hotdesk/CurrentUser**', {
//         statusCode: 200,
//         body: { success: true }
//       }).as('deleteReservation')
      
//       // Click on user dropdown
//       cy.get('[data-testid="user-reservations-dropdown"]').click()
      
//       // Click delete button for first reservation
//       cy.get('[data-testid="delete-reservation-button"]').first().click()
      
//       cy.wait('@deleteReservation')
//       cy.contains('Unreserved successfully').should('be.visible')
//     })
//   })

//   describe('Admin Functionality', () => {
//     beforeEach(() => {
//       // Mock admin user
//       cy.intercept('GET', '**/Employees/Auth', {
//         body: {
//           id: 1,
//           name: 'Admin',
//           surname: 'User',
//           isAdmin: true,
//           isModerator: false,
//           reservations: []
//         }
//       }).as('getAdmin')
      
//       cy.visit('/office/floor-7')
//       cy.wait('@getAdmin')
//       cy.wait('@getDesks')
//     })

//     it('should allow admin to access project desks', () => {
//       // Click on a project desk (should not be restricted for admin)
//       cy.get('[data-testid="desk-DSK7002"]').click()
      
//       // Modal should open without restrictions
//       cy.get('.ant-modal').should('be.visible')
//       cy.get('.bg-blue-50').should('not.exist') // No "view only" alert
//     })

//     it('should allow admin to convert desk types', () => {
//       // Mock desk type change
//       cy.intercept('PUT', '**/Desks/*/Type', {
//         statusCode: 200,
//         body: { success: true }
//       }).as('changeDeskType')
      
//       cy.get('[data-testid="desk-DSK7002"]').click()
      
//       // Change project to Hotdesk
//       cy.get('.ant-select').last().click()
//       cy.contains('Hotdesk').click()
      
//       cy.contains('button', 'Confirm').click()
//       cy.wait('@changeDeskType')
//     })

//     it('should allow admin to delete any reservation', () => {
//       // Mock deletion
//       cy.intercept('DELETE', '**/Reservations**', {
//         statusCode: 200,
//         body: { success: true }
//       }).as('adminDeleteReservation')
      
//       cy.get('[data-testid="desk-DSK7001"]').click()
//       cy.contains('Show All').click()
      
//       // Should see delete buttons for all reservations
//       cy.get('button').contains('Delete').should('be.visible')
//     })
//   })

//   describe('Error Handling', () => {
//     it('should handle API errors gracefully', () => {
//       // Mock API error
//       cy.intercept('GET', '**/Employees/Auth', {
//         statusCode: 500,
//         body: { error: 'Server error' }
//       }).as('getEmployeeError')
      
//       cy.visit('/office-layout/floor-7')
//       cy.wait('@getEmployeeError')
      
//       // Should show error state or fallback
//       cy.contains('Error', { matchCase: false }).should('be.visible')
//     })

//     it('should handle failed reservation creation', () => {
//       cy.visit('/office-layout/floor-7')
//       cy.wait('@getEmployee')
      
//       // Mock failed reservation
//       cy.intercept('POST', '**/Reservations/Hotdesk/CurrentUser', {
//         statusCode: 400,
//         body: { messageCode: 'dateConflict' }
//       }).as('failedReservation')
      
//       cy.get('[data-testid="desk-DSK7001"]').click()
//       cy.get('.ant-picker-range').click()
//       cy.get('.ant-picker-cell-today').click()
//       cy.get('.ant-picker-cell-today').next().click()
//       cy.contains('button', 'Confirm').click()
      
//       cy.wait('@failedReservation')
//       cy.contains('conflict', { matchCase: false }).should('be.visible')
//     })
//   })

//   describe('Responsive Design', () => {
//     it('should work on mobile viewport', () => {
//       cy.viewport('iphone-x')
//       cy.visit('/office-layout/floor-7')
//       cy.wait('@getEmployee')
      
//       // Should still be functional on mobile
//       cy.get('[data-testid="user-reservations-dropdown"]').should('be.visible')
//       cy.get('[data-testid="desk-DSK7001"]').should('be.visible')
//     })

//     it('should work on tablet viewport', () => {
//       cy.viewport('ipad-2')
//       cy.visit('/office-layout/floor-7')
//       cy.wait('@getEmployee')
      
//       cy.get('[data-testid="user-reservations-dropdown"]').click()
//       cy.get('.ant-dropdown').should('be.visible')
//     })
  })
