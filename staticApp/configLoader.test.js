// mocks
define( 'mock/config/ymlTools', ['staticApp/smartEvents'],(ev)=>{ return { loadMerge: (fileList,callback)=>ev.send(callback,{'key':'value'}) }; } );
require.config({map: {
	"staticApp/configLoader": {"staticApp/ymlTools":"mock/config/ymlTools"}
}});
// test
define(['./configLoader','./smartEvents'], (app,ev) => {
	describe('configLoader', () => {
		beforeEach((done)=>{
			app.reset();
			ev.reset();
			setTimeout(done,0);
		});
		afterEach((done)=>{
			app.reset();
			ev.reset();
			setTimeout(done,0);
		});
		it('chargement à vide', () => {
			expect(app.getConfig()).toBeFalsy();
			app.init();
			expect(app.getConfig()).toBeTruthy();
		});
		it('usage externe asynchrone', (done) => {
			ev.need('config',(conf)=>{
				expect(conf.key).toBe("value");
				done();
			});
			app.init();
		});
		it("persistance", () => {
			app.init();
			const config = app.getConfig();
			expect(config.key).toEqual("value");
			config.key = "plop";
			app.reset();
			ev.reset();
			app.init();
			expect(app.getConfig().key).toEqual("plop");

		});
	});
});
