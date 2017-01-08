// mocks
define( 'mock/tradRenderer', ()=>{ return { t: (translateMe)=>translateMe+'-TRAD-OK' }; } );
require.config({map: {
	"staticApp/tradChooser": {
		"staticApp/tradRenderer":"mock/tradRenderer"
	}
}});
// test
define(['./tradChooser', './smartEvents'], (app, ev) => {
	beforeEach(() => {
		//ev.give('config',{"supportedLanguages":['en','fr','ca']});
		//document.body.setAttribute('id','langPicker'); // utiliser addOrReplace
	});

	describe('tradChooser', () => {
		let anchor;
		beforeEach((done)=>{
			//app.reset();
			ev.reset();
			localStorage.clear();
			anchor = document.body;
			anchor.id = "langPicker";
			ev.give('config',{trad:{supportedLanguages:['en','fr','ca'],langPickerId: anchor.id}});
			setTimeout(done,0);
		});
		it('init envoi tradChooser.ready une fois chargé avec ses prérequis', (done) => {
			ev.give('tradLoader',{loadTrad:()=>"osef"});
			ev.on('tradChooser.ready',done);
			app.init();
		});
		it('le sélecteur de langue envoi un évènement au changement de langue', (done) => {
			ev.give('tradLoader',{loadTrad:()=>"osef"});
			ev.on('ca lang change', done);
			ev.on('tradChooser.ready',()=>{
				ev.clickOn(anchor.querySelector('[value="ca"]'));
			});
			app.init();
		});
		it('quand on change de langue : déclanche le chargement de la langue adéquoite', (done) => {
			ev.give('tradLoader',{loadTrad:done});
			ev.on('tradChooser.ready',()=>{
				ev.clickOn(anchor.querySelector('[value="ca"]'));
			});
			app.init();
		});
		it('en cas de langue inconnue, choisi une langue par défaut', (done) => {
			localStorage.setItem('lang','wtfLang');
			ev.give('tradLoader',{loadTrad:(lang)=>{
				if(lang === "en") done();
			}});
			app.init();
		});
		it('en cas de langue inconnue, essai de choisir la langue connu la plus proche', (done) => {
			localStorage.setItem('lang','fr-FR');
			ev.give('tradLoader',{loadTrad:(lang)=>{
				if(lang === "fr") done();
			}});
			app.init();
		});
	});
});
