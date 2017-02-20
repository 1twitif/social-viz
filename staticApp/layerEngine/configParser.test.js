define(['./configParser', "../smartEvents"], (app, ev) => {
	describe('configParser', () => {
		it("convertie la syntaxe des calques de la version simplifié a celle explicite", () => {
			const simple = [{"groupe1": [{"calque": "xpath"}]}];
			const explicite = [{name: "groupe1", subCriteria: [{name: "groupe1_calque", criterion: "xpath"}]}];
			const attendu = app.parseCriteria(simple);
			expect(attendu).toEqual(explicite);
		});
		describe('intégration', () => {
			let preConfig, expected, dummySpy;
			beforeEach( () => {
				ev.reset();
				jasmine.clock().install();
				jasmine.clock().mockDate();

				dummySpy = new Spy();
				preConfig = {
					layers: [{"groupe1": [{"sousGroupe": [{"calque": "xpath"}]}]}],
					nodeSizingModes: [{"mode1": "xpath"}, {"mode2": "xpath"}],
				};
				expected = {
					layers: [{name: "groupe1", subCriteria: [{name: "groupe1_sousGroupe", subCriteria: [{name: "groupe1_sousGroupe_calque", criterion: "xpath"}]}]}],
					nodeSizingModes: [{name: "mode1", criterion: "xpath"}, {name: "mode2", criterion: "xpath"}],
					linkSizingModes: []
				};
			});
			afterEach( ()=>{
				jasmine.clock().uninstall();
				ev.reset();
			});
			it("convertie les calques et sizingModes de la config au chargement.", () => {
				app.init();
				ev.send("config.default", preConfig);
				expect(preConfig).toEqual(expected);
			});
			it("envoi une erreur s'il n'a pas reçu la config 10s après s'être chargé", () => {
				ev.send("config.default", preConfig);
				jasmine.clock().tick(1);
				app.init();
				jasmine.clock().tick(1);
				expect(preConfig).not.toEqual(expected);

				ev.on("err",dummySpy);
				jasmine.clock().tick(10000);
				expect(dummySpy).toHaveBeenCalled();
			});
			it("n'envoi pas d'erreur quand tout va bien.", () => {
				ev.on("err",dummySpy);
				app.init();
				ev.send("config.default", preConfig);
				jasmine.clock().tick(10000);
				expect(dummySpy).not.toHaveBeenCalled();
			});
		});

	});
});
