/// <reference types="cypress" />

const USER_PROFILE = {
	id: 'user-1',
	firstName: 'Test',
	lastName: 'User',
	isGuest: false,
};

const APP_ROOT = '#root';
const THEME_TOGGLE = '[data-cy=theme-toggle]';

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

const luminanceOf = ($el) => {
	const backg = $el.css('background-color');
	const parts = backg.match(/\[d.]+/g).map(Number);
	const [r,g,b] = parts

	const a = parts.length === 4 ? parts[3]: 1;

	if (a === 0) {
		throw new Error(`Element cannot have transparent background: ${backg}`)
	}

	return (r + g + b)/3;
}

const openApp = (prefersDarkMode) => {
	// let isDarkMode = prefersDarkMode;

	cy.intercept('GET', '**/api/user/profile', {
		statusCode: 200,
		body: USER_PROFILE,
	}).as('getProfile');

	// cy.intercept('GET', '**/api/user/settings', (req) => {
	// 	req.reply({
	// 		statusCode: 200,
	// 		body: buildSettingsResponse(isDarkMode),
	// 	});
	// }).as('getSettings');
	cy.intercept('GET', '**/api/user/settings', {
		statusCode: 200,
		body: buildSettingsResponse(prefersDarkMode),
	}).as('getSettings');

	cy.intercept('POST', '**/api/user/settings', (req) => {
		req.reply({
			statusCode: 200,
			body: {},
		});
	}).as('updateSettings');

	cy.intercept('POST', 'https://graphql.csesoc.app/**', { 
		statusCode: 200, 
		body: { data: {} }
	 }).as('graphql');

	cy.visit('/home', {
		onBeforeLoad(win) {
			stubMatchMedia(win, prefersDarkMode);
		},
	});

	// cy.wait(['@getProfile', '@getSettings']);
	cy.wait(['@getProfile', '@getSettings']);

	cy.get('body').should(($body) => {
		if ($body.find('button:contains("CONTINUE")').length) {
			cy.contains('CONTINUE').click();
		}
	})
	// cy.get('body').should('have.css', 'background-color', prefersDarkMode ? 'rgb(33, 33, 33)': 'rgb(250, 250, 250)')
	// cy.contains('Goto Timetable').click();
	cy.get(APP_ROOT).should('be.visible');
};

// describe('light and dark mode', () => {
// 	it('renders the app in light mode and switches to dark mode', () => {
// 		visitWithThemePreference(false),;

// 		cy.get('body').should('have.css', 'background-color', 'rgb(250, 250, 250)');
// 		cy.contains('Dark Mode').should('be.visible').click();

// 		cy.wait(['@updateSettings', '@getSettings']);

// 		cy.get('body').should('have.css', 'background-color', 'rgb(33, 33, 33)');
// 		cy.contains('Light Mode').should('be.visible');
// 	});

// 	it('renders the app in dark mode and switches to light mode', () => {
// 		visitWithThemePreference(true);

// 		cy.get('body').should('have.css', 'background-color', 'rgb(33, 33, 33)');
// 		cy.contains('Light Mode').should('be.visible').click();

// 		cy.wait(['@updateSettings', '@getSettings']);

// 		cy.get('body').should('have.css', 'background-color', 'rgb(250, 250, 250)');
// 		cy.contains('Dark Mode').should('be.visible');
// 	});
// });

// describe('light and dark mode', () => {
// 	it('respects an OS preference for light mode', () => {
// 		visitWithThemePreference(false);
// 		cy.get(APP_ROOT).should(($el) => {
// 			expect(luminanceOf($el)).to.be.greaterThan(155);
// 		});
// 	});

// 	it('respects an OS preference for dark mode', () => {
// 		visitWithThemePreference(true);
// 		cy.get(APP_ROOT).should(($el) => {
// 			expect(luminanceOf($el)).to.be.lessThan(100);
// 		});
// 	});

// 	it('toggles from light to dark and back', () => {
// 		visitWithThemePreference(false);

// 		let lightLuminance;
// 		cy.get(APP_ROOT).then(($el) => {
// 			lightLuminance = luminanceOf($el);
// 		});

// 		cy.get(THEME_TOGGLE).click();
// 		cy.get(APP_ROOT).should(($el) => {
// 			expect(luminanceOf($el)).to.be.lessThan(lightLuminance);
// 		});

// 		cy.get(THEME_TOGGLE).click();
// 		cy.get(APP_ROOT).should(($el) => {
// 			expect(luminanceOf($el)).to.be.closeTo(lightLuminance, 1);
// 		});
// 	});

// 	it('persists the theme choice across a reload', () => {
// 		visitWithThemePreference(false);

// 		cy.get(THEME_TOGGLE).click();
// 		cy.get(APP_ROOT).should(($el) => {
// 			expect(luminanceOf($el)).to.be.lessThan(100);
// 		});

// 		cy.reload();
// 		cy.wait('@getProfile');

// 		cy.get(APP_ROOT).should(($el) => {
// 			expect(luminanceOf($el)).to.be.lessThan(100);
// 		});
// 	});
// });

describe('light and dark mode', () => {
	it('debug: find themed elements', () => {
		cy.visit('/');
		cy.window().then((win) => {
			const hits = [...win.document.querySelectorAll('#root, #root *')]
			.map(el => [el.tagName, el.className, win.getComputedStyle(el).backgroundColor])
			.filter(([,, bg]) => bg !== 'rgba(0, 0, 0, 0)')
			.slice(0, 10);
			console.table(hits);
		});
	});

	it('respects an OS preference for light mode', () => {
		openApp(false);
		cy.get(APP_ROOT).should(($el) => {
			expect(luminanceOf($el)).to.be.greaterThan(155);
		});
	});

	it('respects an OS preference for dark mode', () => {
		openApp(true);
		cy.get(APP_ROOT).should(($el) => {
			expect(luminanceOf($el)).to.be.lessThan(100);
		});
	});

	it('toggles from light to dark and back forth', () => {
		openApp(false);

		let lightLuminance;
		cy.get(APP_ROOT).then(($el) => {
			lightLuminance = luminanceOf($el)
		});

		cy.get(THEME_TOGGLE).click();
		cy.get(THEME_TOGGLE).then(($el) => {
			expect(luminanceOf($el)).to.be.lessThan(lightLuminance);
		})

		cy.get(THEME_TOGGLE).click();
		cy.get(THEME_TOGGLE).then(($el) => {
			expect(luminanceOf($el)).to.be.closeTo(lightLuminance, 1);
		})
	});

	it('persisting the theme from reloading', () => {
		openApp(false)

		cy.get(THEME_TOGGLE).click();
		cy.get(THEME_TOGGLE).then(($el) => {
			expect(luminanceOf($el)).to.be.lessThan(100);
		})

		cy.reload();
		cy.wait('@getProfile');

		cy.get(THEME_TOGGLE).then(($el) => {
			expect(luminanceOf($el)).to.be.lessThan(100);
		})
	})
})