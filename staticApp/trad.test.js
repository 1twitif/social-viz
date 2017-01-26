// mocks
define( 'mock/ymlTools', ()=>{ return { loadMerge: (fileList,callback)=>callback({'key':'value'}) }; } );
require.config({map: {
	"staticApp/tradLoader": {"staticApp/ymlTools":"mock/ymlTools"}
}});
// test
define(['./trad', './smartEvents'], (app, ev) => {
	describe('trad', () => {
		beforeEach(ev.reset);
		afterEach(ev.reset);
		it("initialise le nécessaire pour pouvoir traduire", () => {
			app.init();
			expect(app.t("key")).toBe("value");
		});
	});
});
