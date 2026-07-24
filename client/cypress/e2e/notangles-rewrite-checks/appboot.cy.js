/// <reference types="cypress" />

describe("app booting", () => {
  // successful (will be further validated with the BE)
  it("loads the main page", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });
});
