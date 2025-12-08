describe('Booking Flow', () => {
    it('Should search for Surf and click reserve', () => {
        cy.visit('http://localhost:4200');

        // Type in search
        cy.get('input[placeholder="Rechercher..."]').type('Surf');
        // Ensure URL updates or filter applies (mocked)

        // Click first service
        cy.get('.card-standard').first().click();

        // Assert Reserve button exists
        cy.contains('Réserver').should('be.visible');

        // Click Reserve
        cy.contains('Réserver').click();

        // Should verify redirect if not logged in
        cy.url().should('include', '/login');
    });
});
