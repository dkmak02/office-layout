describe('Hotdesk Reservations E2E Tests', () => {
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
    
    // Mock unassigned employees endpoint
    cy.intercept('GET', '**/Employees/Unassigned*', {
      body: []
    }).as('getUnassignedEmployees')
    
    // Mock any other potential API calls that might need authentication
    cy.intercept('GET', '**/Projects/**', {
      body: []
    }).as('getProjectInfo')
  })

  describe('Hotdesk Reservations', () => {
    beforeEach(() => {
      cy.visit('/office/floor-7')
      cy.wait('@getEmployee')
      cy.wait('@getDesks')
    })

    it('should allow employee to click on hotdesk and see reservation modal', () => {
      // Click on a hotdesk (mock data should have hotdesk: true)
      cy.get('[data-testid="desk-DSK7009"]')
        .should('be.visible')
        .click()
      
      // Modal should open
      cy.get('.ant-modal').should('be.visible')
      cy.get('.ant-modal-title').should('contain', 'DSK7009')
    })

    it('should show availability restrictions for employees with 0% availability', () => {
      // Mock employee with 0% availability
      cy.intercept('GET', '**/Employees/Auth', {
        body: {
          id: 13439,
          name: 'Dawid',
          surname: 'Kmak',
          isAdmin: false,
          isModerator: false,
          reservations: []
        }
      }).as('getRestrictedEmployee')
      
      cy.intercept('GET', '**/Employees', {
        body: [{
          id: 13439,
          name: 'Dawid',
          surname: 'Kmak',
          availability: '0'
        }]
      }).as('getRestrictedEmployees')
      
      cy.reload()
      cy.wait('@getRestrictedEmployee')
      cy.wait('@getRestrictedEmployees')
      
      // Click on hotdesk
      cy.get('[data-testid="desk-DSK7009"]').click()
      
      cy.contains('Hotdesk Unavailable').should('be.visible')
      cy.contains('availability is set to 0%').should('be.visible')
    })

    it('should allow eligible employee to make hotdesk reservation', () => {
      // Mock successful reservation creation
      cy.intercept('POST', '**/Reservations/Hotdesk/CurrentUser', (req) => {
        // Validate the parameters being sent
        expect(req.query).to.have.property('deskID', '3') // DSK7009 has deskId 3
        expect(req.query).to.have.property('employeeID', '13439')
        expect(req.query).to.have.property('startTime')
        expect(req.query).to.have.property('endTime')
        
        // Mock successful response
        req.reply({
          statusCode: 200,
          body: { success: true }
        })
      }).as('createReservation')
      
      // Alternative: If you need to make real API calls with authentication
      // cy.request({
      //   method: 'POST',
      //   url: 'https://localhost:7180/Reservations/Hotdesk/CurrentUser',
      //   qs: {
      //     deskID: 3,
      //     employeeID: 13439,
      //     startTime: '2025-06-11T00:00:01',
      //     endTime: '2025-06-12T23:59:00'
      //   },
      //   headers: {
      //     'Authorization': 'Bearer your-test-token'
      //   },
      //   failOnStatusCode: false
      // })
      
      // Click on available hotdesk
      cy.get('[data-testid="desk-DSK7009"]').click()
      
      // Select dates
      cy.get('.ant-picker-range').click()
      cy.get('.ant-picker-cell-today').click()
      cy.get('.ant-picker-cell-today').next().click()
      
      // Confirm reservation
      cy.contains('button', 'Confirm').click()
      
      cy.wait('@createReservation')
      cy.contains('Hotdesk reservation created successfully').should('be.visible')
    })
  })
})