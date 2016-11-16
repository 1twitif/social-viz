define(['./form'], (app) => {
	describe('formulaire', () => {
		describe('yml -> objet formulaire', () => {
			it("Construit un formulaire vide", () => {
				const form = new app.Form();
				expect(form instanceof app.Form).toBeTruthy();
			});
		});
		describe('objet formulaire -> affichage', () => {
			it('test nothing', () => {
				expect(1).toBe(1);
			});
		});
		describe('affichage / saisie -> données exportable et affichable', () => {
			it('test nothing', () => {
				expect(1).toBe(1);
			});
		});
	});
});
