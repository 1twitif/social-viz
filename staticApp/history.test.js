define(['./history','./smartEvents'], (app,ev) => {
	const mockTrad = { t: (translateMe)=>translateMe+'-TRAD-OK' };
	describe('history', () => {
		"use strict";
		beforeEach((done)=>{
			app.reset();
			ev.reset();
			app.init();
			setTimeout(done,0);
		});
		afterEach((done)=>{
			app.reset();
			ev.reset();
			setTimeout(done,0);
		});
		it("ajoute un état à l'historique de navigation", () => {
			const historySizeBefore = history.length;
			if(historySizeBefore == 50) console.error("historique saturé, test invalide");
			ev.send("config.selected.change");
			expect(history.length).toEqual(historySizeBefore+1);

		});
		xit("titre noeud sélectionné", () => {
		});
		xit("titre recherche active", () => {
		});
		xit("titre mode édition", () => {
		});
	});
});
