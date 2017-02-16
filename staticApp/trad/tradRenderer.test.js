define(['./tradRenderer', '../smartEvents'], (app, ev) => {
	describe('tradRenderer', () => {
		let anchor;
		beforeEach((done)=>{
			app.reset();
			ev.reset();
			anchor = document.body;
			app.init();
			setTimeout(done,0);
		});
		afterEach(()=>{
			ev.reset();
			document.body.innerHTML = '';
		});
		function template(tradData,expected){
			ev.send("trad.loaded",tradData);
			expect(app.t('key')).toBe(expected);
		}
		it('traduction basique', () => template({'key': 'value'},'value') );
		it("traduction à l'identique par défaut", () => template({},'key') );
		it("en cas de traduction vide, retourne la clef", () => template({'key':''},'key') );
		describe('refreshTrad', () => {
			function baseRefreshTrad(donnéesTest){
				anchor.innerHTML = donnéesTest;
				ev.send("trad.loaded",{'key': 'value'});
			}
			function refreshTemplate(donnéesTest,expectedMatch,expectNot = false){
				baseRefreshTrad(donnéesTest);
				if(expectNot) expect(anchor.innerHTML).not.toMatch(expectedMatch);
				else expect(anchor.innerHTML).toMatch(expectedMatch);
			}
			it("traduit les chaines statiques du html", () => refreshTemplate("key","value") );
			it("re-traduit les chaines statiques déjà traduites", () => {
				baseRefreshTrad("key");
				ev.send("trad.loaded",{'key': 'valeur'});
				expect(anchor.innerHTML).toMatch("valeur");
			});
			it("traduit les attributs de données",
				() => refreshTemplate('<input placeholder="key" value="key" title="key"/>',"key",true)
			);
			it("ne traduit pas les attributs systèmes (id, class, type)",
				() => refreshTemplate('<input id="key" class="key" type="key"/>',"value",true)
			);
		});
	});
});
