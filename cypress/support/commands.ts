/// <reference types="cypress" />

// Custom commands for DeskHub API testing

declare global {
  namespace Cypress {
    interface Chainable {
      reserveHotdesk(deskId: string, employeeId: number, startTime: string, endTime: string): Chainable<any>
      reserveProjectDesk(deskId: string, employeeId: number): Chainable<any>
      deleteReservation(reservationId: number, useHotdeskEndpoint?: boolean): Chainable<any>
      getDesks(floor?: string, date?: string): Chainable<any>
      getEmployees(): Chainable<any>
      getProjects(floor?: string, date?: string): Chainable<any>
      getLogs(pageNumber: number, pageSize: number): Chainable<any>
      reserveHotdeskCurrentUser(deskId: string, startTime: string, endTime: string): Chainable<any>
      getUnassignedEmployees(date: string): Chainable<any>
      getCurrentUser(): Chainable<any>
      syncProjects(): Chainable<any>
    }
  }
}

// Command to make hotdesk reservation
Cypress.Commands.add('reserveHotdesk', (deskId: string, employeeId: number, startTime: string, endTime: string) => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/Reservations/Hotdesk`,
    body: null,
    qs: {
      deskID: deskId,
      employeeID: employeeId,
      startTime: startTime,
      endTime: endTime
    },
    failOnStatusCode: false
  })
})

// Command to make project desk reservation
Cypress.Commands.add('reserveProjectDesk', (deskId: string, employeeId: number) => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/Reservations/Project`,
    body: null,
    qs: {
      deskID: deskId,
      employeeID: employeeId
    },
    failOnStatusCode: false
  })
})

// Command to delete reservation
Cypress.Commands.add('deleteReservation', (reservationId: number, useHotdeskEndpoint: boolean = false) => {
  const apiUrl = Cypress.env('apiUrl')
  const url = useHotdeskEndpoint 
    ? `${apiUrl}/Reservations/Hotdesk/CurrentUser?reservationID=${reservationId}`
    : `${apiUrl}/Reservations?reservationID=${reservationId}`
  
  return cy.request({
    method: 'DELETE',
    url: url,
    failOnStatusCode: false
  })
})

// Command to get desks
Cypress.Commands.add('getDesks', (floor?: string, date?: string) => {
  const apiUrl = Cypress.env('apiUrl')
  const url = floor && date 
    ? `${apiUrl}/Desks?Floor=${floor}&PointInTime=${date}`
    : `${apiUrl}/Desks`
  
  return cy.request({
    method: 'GET',
    url: url,
    failOnStatusCode: false
  })
})

// Command to get employees
Cypress.Commands.add('getEmployees', () => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/Employees`,
    failOnStatusCode: false
  })
})

// Command to get projects
Cypress.Commands.add('getProjects', (floor?: string, date?: string) => {
  const apiUrl = Cypress.env('apiUrl')
  const url = floor && date 
    ? `${apiUrl}/Projects?Floor=${floor}&PointInTime=${date}`
    : `${apiUrl}/Projects`

  return cy.request({
    method: 'GET',
    url: url,
    failOnStatusCode: false
  })
})

// Command to get logs
Cypress.Commands.add('getLogs', (pageNumber: number, pageSize: number) => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/Logs/${pageNumber}/${pageSize}`,
    failOnStatusCode: false
  })
})

// Command to make hotdesk reservation for current user
Cypress.Commands.add('reserveHotdeskCurrentUser', (deskId: string, startTime: string, endTime: string) => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/Reservations/Hotdesk/CurrentUser`,
    body: null,
    qs: {
      deskID: deskId,
      startTime: startTime,
      endTime: endTime
    },
    failOnStatusCode: false
  })
})

// Command to get unassigned employees
Cypress.Commands.add('getUnassignedEmployees', (date: string) => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/Employees/Unassigned`,
    qs: {
      pointInTime: date
    },
    failOnStatusCode: false
  })
})

// Command to get current user
Cypress.Commands.add('getCurrentUser', () => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/Employees/Auth`,
    failOnStatusCode: false
  })
})

// Command to sync projects
Cypress.Commands.add('syncProjects', () => {
  const apiUrl = Cypress.env('apiUrl')
  
  return cy.request({
    method: 'DELETE',
    url: `${apiUrl}/Projects/Sync`,
    failOnStatusCode: false
  })
})

export {}