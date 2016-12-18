// mocks
define( 'mock/ymlTools', ()=>{ return { loadMerge: (fileList,callback)=>callback({'key':'value'}) }; } );
require.config({map: {
		"staticApp/tradLoader": {"staticApp/ymlTools":"mock/ymlTools"}
}});
// test
define(['./tradLoader','./smartEvents'], (app,ev) => {
	describe('tradLoader', () => {
		beforeEach(function() {
			app.reset();
			localStorage.clear();
		});
		it('chargement à vide', () => {
			expect(app.getTradData()).toBeFalsy();
			app.loadTrad('fr');
			expect(app.getTradData()).toBeTruthy();
		});
		it('usage externe asynchrone', (done) => {
			app.init();
			ev.give('config',{});
			ev.need('tradLoader',(initialisedApp)=>{
				expect(initialisedApp.getTradData()).toBeFalsy();
				initialisedApp.loadTrad('fr');
				expect(initialisedApp.getTradData()).toBeTruthy();
				done();
			});
		});
		it("chargement avec fichier", () => {
			app.init({traductionFilesPath:["path/"]});
			expect(app.getTradData()).toBeFalsy();
			app.loadTrad('fr');
			expect(app.getTradData()['key']).toEqual('value');
		});
		it("chargement avec fichier et modification locale", () => {
			app.init({traductionFilesPath:["path/"]});
			localStorage.setItem('trad.fr',JSON.stringify({'key':'toto'}));
			app.loadTrad('fr');
			expect(app.getTradData()['key']).toEqual('toto');
		});
		it("chargement avec fichier et ajout local", () => {
			app.init({traductionFilesPath:["path/"]});
			localStorage.setItem('trad.fr',JSON.stringify({'k2':'toto'}));
			app.loadTrad('fr');
			expect(app.getTradData()['key']).toEqual('value');
			expect(app.getTradData()['k2']).toEqual('toto');
		});
		it("chargement de plusieurs langues successivement", () => {
			localStorage.setItem('trad.en',JSON.stringify({'k2':'tea'}));
			localStorage.setItem('trad.fr',JSON.stringify({'k2':'thé'}));
			app.loadTrad('fr');
			expect(app.getTradData()['k2']).toEqual('thé');
			app.loadTrad('en');
			expect(app.getTradData()['k2']).toEqual('tea');
			app.loadTrad('fr');
			expect(app.getTradData()['k2']).toEqual('thé');
		});
		it("mémorise les changement de traduction", () => {
			localStorage.setItem('trad.en',JSON.stringify({'k2':'tea'}));
			app.loadTrad('fr');
			expect(app.getTradData()['k2']).not.toEqual('thé');
			app.getTradData()['k2'] = 'thé';
			app.loadTrad('en');
			expect(app.getTradData()['k2']).toEqual('tea');
			app.loadTrad('fr');
			expect(app.getTradData()['k2']).toEqual('thé');
		});
	});
});
