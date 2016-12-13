define(['./tradRenderer'], (app) => {
	describe('tradRenderer', () => {
		it('traduction basique', () => {
			app.setTrad({'key': 'value'});
			expect(app.t('key')).toBe('value');
		});
		it("traduction à l'identique par défaut", () => {
			app.setTrad({});
			expect(app.t('key')).toBe('key');
		});
		it("en cas de traduction vide, retourne la clef", () => {
			app.setTrad({'référenceTrad':''});
			expect(app.t('référenceTrad')).toBe('référenceTrad');
		});
	});
});
