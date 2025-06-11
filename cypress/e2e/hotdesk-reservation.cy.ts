// cypress/e2e/deskhub-api.cy.js
// Sample Cypress tests using existing DeskHub API endpoints

describe('DeskHub E2E Tests - Real API', () => {
  const TEST_API_BASE = 'http://localhost:5555';

  before(() => {
    // Start the test API server
    cy.task('startTestApiServer');
  });

  after(() => {
    // Stop the test API server  
    cy.task('stopTestApiServer');
  });

  beforeEach(() => {
    // Reset database for each test
    cy.task('resetTestDatabase');
  });

  describe('API Endpoints', () => {
    
    it('should get projects and floor information', () => {
      cy.request({
        method: 'GET',
        url: `${TEST_API_BASE}/Projects`,
        qs: {
          floor: 'Ground Floor',
          pointInTime: '2024-01-15T12:00:00Z'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        // Should include HotDesk as first item
        const hotdesk = response.body[0];
        expect(hotdesk.code).to.eq('HotDesk');
        expect(hotdesk.name).to.eq('HotDesk');
        expect(hotdesk.total).to.be.a('number');
        expect(hotdesk.taken).to.be.a('number');
      });
    });

    it('should get desks for a floor', () => {
      cy.request({
        method: 'GET', 
        url: `${TEST_API_BASE}/Desks`,
        qs: {
          floor: 'Ground Floor',
          pointInTime: '2024-01-15T12:00:00Z'  
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('desks');
        expect(response.body.desks).to.be.an('array');
        
        // Check desk structure
        const desk = response.body.desks[0];
        expect(desk).to.have.property('deskId');
        expect(desk).to.have.property('name');
        expect(desk).to.have.property('deskType');
        expect(desk).to.have.property('x');
        expect(desk).to.have.property('y');
      });
    });

    it('should get all employees', () => {
      cy.request({
        method: 'GET',
        url: `${TEST_API_BASE}/Employees`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);
        
        // Check employee structure
        const employee = response.body[0];
        expect(employee).to.have.property('id');
        expect(employee).to.have.property('name');
        expect(employee).to.have.property('surname');
      });
    });

    it('should test reservation overlap exception', () => {
      // Try to create a reservation that should cause an overlap
      cy.request({
        method: 'POST',
        url: `${TEST_API_BASE}/Reservations/Project`,
        qs: {
          deskID: 1,
          employeeID: 1
        },
        failOnStatusCode: false // Don't fail on 4xx/5xx status codes
      }).then((response) => {
        expect(response.status).to.eq(409); // Conflict
        expect(response.body).to.have.property('messageCode', 'DeskReservationOverlapException');
        expect(response.body).to.have.property('message');
      });
    });

    it('should create hotdesk reservation', () => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1); // Tomorrow
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 8); // 8 hours later

      cy.request({
        method: 'POST',
        url: `${TEST_API_BASE}/Reservations/Hotdesk`,
        qs: {
          deskID: 1,
          employeeID: 2, // Different employee to avoid conflicts
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id');
      });
    });
  });

  describe('Frontend Integration', () => {
    
    it('should configure frontend to use test API', () => {
      // Visit your frontend and configure it to use test API
      cy.visit('/');
      
      // Set the API base URL in localStorage or however your app configures it
      cy.window().then((win) => {
        win.localStorage.setItem('apiBaseUrl', TEST_API_BASE);
      });

      // Intercept API calls and redirect to test server
      cy.intercept('GET', '**/Projects*', (req) => {
        req.url = req.url.replace(req.url.split('/Projects')[0], TEST_API_BASE);
      }).as('getProjects');

      cy.intercept('GET', '**/Desks*', (req) => {
        req.url = req.url.replace(req.url.split('/Desks')[0], TEST_API_BASE);
      }).as('getDesks');

      // Now test your frontend behavior
      // Example: Test floor selection
      cy.get('[data-testid="floor-selector"]').should('exist');
      
      // Wait for API calls to complete
      cy.wait('@getProjects');
      cy.wait('@getDesks');
      
      // Assert UI state
      cy.get('[data-testid="desk-grid"]').should('be.visible');
    });

    it('should handle reservation errors in frontend', () => {
      cy.visit('/');
      cy.window().then((win) => {
        win.localStorage.setItem('apiBaseUrl', TEST_API_BASE);
      });

      // Intercept reservation API calls
      cy.intercept('POST', '**/Reservations/**', (req) => {
        req.url = req.url.replace(req.url.split('/Reservations')[0], TEST_API_BASE);
      }).as('createReservation');

      // Try to create a conflicting reservation through UI
      cy.get('[data-testid="desk-1"]').click();
      cy.get('[data-testid="reserve-button"]').click();
      
      cy.wait('@createReservation');
      
      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('contain', 'This desk is already reserved')
    });
  });
});