define(['./tradRenderer', './smartEvents'], (app, ev) => {
	describe('tradRenderer', () => {
		let anchor;
		beforeEach((done)=>{
			app.reset();
			ev.reset();
			anchor = document.body;
			app.init();
			setTimeout(done,0);
		});
		afterEach(ev.reset);
		it('traduction basique', () => {
			ev.send("trad.loaded",{'key': 'value'});
			expect(app.t('key')).toBe('value');
		});
		it("traduction à l'identique par défaut", () => {
			ev.send("trad.loaded",{});
			expect(app.t('key')).toBe('key');
		});
		it("en cas de traduction vide, retourne la clef", () => {
			ev.send("trad.loaded",{'référenceTrad':''});
			expect(app.t('référenceTrad')).toBe('référenceTrad');
		});
		describe('refreshTrad', () => {
			function baseRefreshTrad(contenuTest){
				anchor.innerHTML = contenuTest;
				ev.send("trad.loaded",{'key': 'value'});
			}
			it("traduit les chaines statiques du html", () => {
				baseRefreshTrad("key");
				expect(anchor.innerHTML).toBe("value");
			});
			it("re-traduit les chaines statiques déjà traduites", () => {
				baseRefreshTrad("key");
				ev.send("trad.loaded",{'key': 'valeur'});
				expect(anchor.innerHTML).toBe("valeur");
			});
			it("traduit les attributs de données", () => {
				baseRefreshTrad('<input placeholder="key" value="key" title="key"/>');
				expect(anchor.querySelector('input').outerHTML).not.toMatch("key");
			});
			it("ne traduit pas les attributs systèmes (id, class, type)", () => {
				baseRefreshTrad('<input id="key" class="key" type="key"/>');
				expect(anchor.querySelector('input').outerHTML).not.toMatch("value");
			});
		});
	});
});
