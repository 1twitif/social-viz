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
			function baseTradText(){
				anchor.innerHTML = "key";
				ev.send("trad.loaded",{'key': 'value'});
			}
			it("traduit les chaines statiques du html", () => {
				baseTradText();
				expect(anchor.innerHTML).toBe("value");
			});
			it("re-traduit les chaines statiques déjà traduites", () => {
				baseTradText();
				ev.send("trad.loaded",{'key': 'valeur'});
				expect(anchor.innerHTML).toBe("valeur");
			});
			it("traduit les attributs dans le html", () => {
				anchor.innerHTML = '<input placeholder="key"/>';
				ev.send("trad.loaded",{'key': 'value'});
				expect(anchor.querySelector('input').placeholder).toBe("value");
			});
			it("ne traduit pas les id", () => {
				anchor.innerHTML = '<input id="key"/>';
				ev.send("trad.loaded",{'key': 'value'});
				expect(anchor.querySelector('input').id).toBe("key");
			});
			it("ne traduit pas les class", () => {
				anchor.innerHTML = '<input class="key"/>';
				ev.send("trad.loaded",{'key': 'value'});
				expect(anchor.querySelector('input').className).toBe("key");
			});
		});
	});
});
