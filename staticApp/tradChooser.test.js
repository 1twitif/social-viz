// mocks
define( 'mock/tradRenderer', ()=>{ return { t: (translateMe)=>translateMe+'-TRAD-OK' }; } );
define( 'mock/tradLoader', ()=>{ return { t: (translateMe)=>'osef' }; } );
require.config({map: {
	"staticApp/tradChooser": {
		"staticApp/tradRenderer":"mock/tradRenderer",
		"staticApp/tradLoader":"mock/tradLoader"
	}
}});
// test
define(['./tradChooser', './smartEvents'], (app, ev) => {
	beforeEach(() => {
		ev.on('need.config',()=>ev.send('config.asked',{"supportedLanguages":['en','fr','ca']}));
		//document.body.setAttribute('id','langPicker'); // utiliser addOrReplace
	});

	describe('tradChooser', () => {
		xit('le sélecteur de langue envoi un évènement au changement de langue', (done) => {
			const langPicker = app.buildLangPicker(['en','fr','ca'], 'fr');
			ev.on('ca lang change', done);
			ev.clickOn(langPicker.querySelector('[value="ca"]'));
		});
	});
});
