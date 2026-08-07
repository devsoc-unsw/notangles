/// <reference types="cypress" />

const USER_PROFILE = {
	id: 'user-1',
	firstName: 'Test',
	lastName: 'User',
	isGuest: false,
};

const buildSettingsResponse = (isDarkMode) => ({
	preferredTheme: 'Classic',
	is12HourMode: true,
	isDarkMode,
	isSquareEdges: false,
	hideFullClasses: false,
	hideClassInfo: false,
	unscheduleClassesByDefault: true,
	hideExamClasses: false,
	convertToLocalTimezone: false,
});

const stubMatchMedia = (win, prefersDarkMode) => {
	win.matchMedia = (query) => ({
		matches: prefersDarkMode && query === '(prefers-color-scheme: dark)',
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
};

const visitWithThemePreference = (prefersDarkMode) => {
	let isDarkMode = prefersDarkMode;

	cy.intercept('GET', '**/api/user/profile', {
		statusCode: 200,
		body: USER_PROFILE,
	}).as('getProfile');

	cy.intercept('GET', '**/api/user/settings', (req) => {
		req.reply({
			statusCode: 200,
			body: buildSettingsResponse(isDarkMode),
		});
	}).as('getSettings');

	cy.intercept('POST', '**/api/user/settings', (req) => {
		isDarkMode = Boolean(req.body?.isDarkMode);
		req.reply({
			statusCode: 200,
			body: {},
		});
	}).as('updateSettings');

	cy.visit('/', {
		onBeforeLoad(win) {
			stubMatchMedia(win, prefersDarkMode);
		},
	});

	cy.wait(['@getProfile', '@getSettings']);
};

describe('light and dark mode', () => {
	it('renders the app in light mode and switches to dark mode', () => {
		visitWithThemePreference(false);

		cy.get('body').should('have.css', 'background-color', 'rgb(250, 250, 250)');
		cy.contains('Dark Mode').should('be.visible').click();

		cy.wait(['@updateSettings', '@getSettings']);

		cy.get('body').should('have.css', 'background-color', 'rgb(33, 33, 33)');
		cy.contains('Light Mode').should('be.visible');
	});

	it('renders the app in dark mode and switches to light mode', () => {
		visitWithThemePreference(true);

		cy.get('body').should('have.css', 'background-color', 'rgb(33, 33, 33)');
		cy.contains('Light Mode').should('be.visible').click();

		cy.wait(['@updateSettings', '@getSettings']);

		cy.get('body').should('have.css', 'background-color', 'rgb(250, 250, 250)');
		cy.contains('Dark Mode').should('be.visible');
	});
});
