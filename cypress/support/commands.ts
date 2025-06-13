/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getCurrentUser(): Chainable<Cypress.Response<any>>
      getDesks(floor: string, date: string): Chainable<Cypress.Response<any>>
      getProjects(): Chainable<Cypress.Response<any>>
      getEmployees(): Chainable<Cypress.Response<any>>
      createHotdeskReservation(deskId: string, employeeId: number, startTime: string, endTime: string): Chainable<Cypress.Response<any>>
      createProjectDeskReservation(deskId: string, employeeId: number): Chainable<Cypress.Response<any>>
      deleteReservation(reservationId: number): Chainable<Cypress.Response<any>>
      syncProjects(): Chainable<Cypress.Response<any>>
    }
  }
}

// Helper function to make authenticated requests
const makeAuthenticatedRequest = (options: Partial<Cypress.RequestOptions>) => {
  const apiUrl = Cypress.env('apiUrl')
  return cy.request({
    ...options,
    url: `${apiUrl}${options.url}`,
    failOnStatusCode: false,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'NTLM',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    }
  })
}

// API Commands
Cypress.Commands.add('getCurrentUser', () => {
  return makeAuthenticatedRequest({
    method: 'GET',
    url: '/Employees/Auth'
  })
})

Cypress.Commands.add('getDesks', (floor: string, date: string) => {
  return makeAuthenticatedRequest({
    method: 'GET',
    url: '/Desks',
    qs: {
      Floor: floor,
      PointInTime: date
    }
  })
})

Cypress.Commands.add('getProjects', () => {
  return makeAuthenticatedRequest({
    method: 'GET',
    url: '/Projects'
  })
})

Cypress.Commands.add('getEmployees', () => {
  return makeAuthenticatedRequest({
    method: 'GET',
    url: '/Employees'
  })
})

Cypress.Commands.add('createHotdeskReservation', (deskId: string, employeeId: number, startTime: string, endTime: string) => {
  return makeAuthenticatedRequest({
    method: 'POST',
    url: '/Reservations/Hotdesk',
    body: null,
    qs: {
      deskID: deskId,
      employeeID: employeeId,
      startTime: startTime,
      endTime: endTime
    }
  })
})

Cypress.Commands.add('createProjectDeskReservation', (deskId: string, employeeId: number) => {
  return makeAuthenticatedRequest({
    method: 'POST',
    url: '/Reservations/Project',
    body: null,
    qs: {
      deskID: deskId,
      employeeID: employeeId
    }
  })
})

Cypress.Commands.add('deleteReservation', (reservationId: number) => {
  return makeAuthenticatedRequest({
    method: 'DELETE',
    url: '/Reservations',
    qs: {
      reservationID: reservationId
    }
  })
})

Cypress.Commands.add('syncProjects', () => {
  return makeAuthenticatedRequest({
    method: 'DELETE',
    url: '/Projects/Sync'
  })
})

export {}