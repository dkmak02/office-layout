const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(_on: Cypress.PluginEvents, _config: Cypress.PluginConfigOptions) {
      // implement node event listeners here
    },
    env: {
      apiUrl: 'http://localhost:7180'
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    requestTimeout: 10000,
    responseTimeout: 10000,
    defaultCommandTimeout: 10000
  }
})