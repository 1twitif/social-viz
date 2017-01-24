define([
	'./smartEvents',
	'./htmlTools'
], (ev, htmlTools) => {
	const on = ev.on, send = ev.send;

	let validLanguages = [], langPickerId, lang, tradLoader;

	//TODO: adapter à gettext et weblate
	// ressources bonus : http://i18next.com/ http://slexaxton.github.io/Jed/ http://l10ns.org/

	function init() {
		listenerInit();
		ev.after(['tradChooser.conf.ok','tradChooser.tradLoader.ok'],()=>{
			send('lang.change', getValidLang());
			send('tradChooser.ready');
		});
		ev.need('config',(config)=>{
			validLanguages = config.trad.supportedLanguages;
			langPickerId = config.trad.langPickerId;
			send('tradChooser.conf.ok');
		});
		ev.need('tradLoader',(tradL)=>{
			tradLoader = tradL;
			send('tradChooser.tradLoader.ok');
		});
	}
	function listenerInit() {
		on('lang.change', updateLangPicker);
		on('lang.change', updateLang);
	}
	function getValidLang() {
		let lang = localStorage.getItem('lang') || navigator.language;
		if (!validLanguages.includes(lang)) lang = lang.substring(0, 2);
		if (!validLanguages.includes(lang)) lang = validLanguages[0];
		return lang;
	}

	function updateLangPicker(lang) {
		const langPicker = htmlTools.buildLangPicker(validLanguages,lang);
		langPicker.addEventListener('change', (e)=>changeLang(e.target.value));
		const anchor = document.getElementById(langPickerId);
		htmlTools.addOrReplace(langPicker,anchor);
	}

	function updateLang(lang) {
		tradLoader.loadTrad(lang);
		send('lang.updated', lang);
	}

	function changeLang(newLang) {
		localStorage.setItem('lang', newLang);
		send(newLang+'.lang.change', newLang);
	}

	return {init}
});
