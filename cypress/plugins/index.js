/// <reference types="cypress" />
let percyHealthCheck = require("@percy/cypress/task");
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

module.exports = (on, config) => {
	on("task", percyHealthCheck);
	on("task", {
		log(message) {
			console.log(message);

			return null;
		},
		table(message) {
			console.table(message);

			return null;
		},
	});
};
