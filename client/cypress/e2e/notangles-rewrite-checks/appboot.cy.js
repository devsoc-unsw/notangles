/// <reference types="cypress" />

describe("app booting", () => {
  // successful (will be further validated with the BE)
  it("loads the main page", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });

  it("validates the landing page regardless if profile fetching fails", () => {
    cy.intercept("GET", "**/api/user/profile").as("profile");
    cy.visit("/");
    cy.wait("@profile").its("response.statusCode").should("be.oneOf", [401, 403]);
    cy.contains("Get Started").should("be.visible");
  });

  
});
