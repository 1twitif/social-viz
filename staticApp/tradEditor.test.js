define(['./tradEditor', './smartEvents', './MonitoredStruct'], (app,ev,mStruct) => {
	describe('tradEditor', () => {
		it("active le mode d'édition de traduction au clic sur le bouton trad", (done) => {
			ev.reset();
			const button = document.createElement("button");
			button.id = "editTrad";
			document.body.appendChild(button);
			const mockCfg = new mStruct.MonitoredStruct({trad:{tradModeTriggerId: "editTrad"}},"config");
			ev.give("config", mockCfg);
			app.init();
			ev.on("config.userMode change",done);
			ev.clickOn(button);
			//expect(document.getElementById("editTrad")).toBeTruthy();
		});
		xit("affiche le formulaire de traduction quand config.userMode est sur trad", (done) => {


		});
	});
});
