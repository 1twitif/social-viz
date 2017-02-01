define(['./tradEditor', '../smartEvents', '../MonitoredStruct'], (app, ev, mStruct) => {
	beforeEach(ev.reset);
	afterEach(ev.reset);
	describe('tradEditor', () => {
		it("active le mode d'édition de traduction au clic sur le bouton trad", (done) => {
			const button = document.createElement("button");
			button.id = "editTrad";
			document.body.appendChild(button);
			const mockCfg = new mStruct.MonitoredStruct({trad:{tradModeTriggerId: "editTrad"}},"config");
			ev.give("config", mockCfg);
			app.init();

			ev.on("config.userMode change",done);

			ev.clickOn(button);
		});
		it("affiche le formulaire de traduction quand config.userMode est sur trad", () => {
			ev.give("config", {userMode:"trad",trad:{formAnchorSelector:"body"}});
			ev.give("tradLoader", {getTradData: ()=>{return {key:"value"};}});
			app.init();
			ev.send("trad.applied"); //FIXME: devrait pouvoir arriver avant sans bloquer l'éditeur de trad.
			//TODO: explorer tout social-viz pour s'assurer d'avoir toutes les trad au moment d'afficher l'éditeur
			expect(document.getElementById("tradForm")).toBeTruthy();
			expect(document.querySelector('#tradForm input[name="key"]')).toBeTruthy();
		});
		it("répercute les changements de la vue sur le modèle (champs input -> objet tradData)", () => {
			ev.give("config", {userMode:"trad",trad:{formAnchorSelector:"body"}});
			const tradData = {key:"value"};
			ev.give("tradLoader", {getTradData: ()=>tradData});
			app.init();
			ev.send("trad.applied");
			changeInputValue(document.querySelector('#tradForm input[name="key"]'), "anyThingElse");
			expect(tradData.key).toBe("anyThingElse");
		});


	});
});
