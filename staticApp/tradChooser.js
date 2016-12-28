define([
	'./smartEvents',
	'./htmlTools',
	'./tradRenderer'
], (ev, htmlTools, tradR) => {
	'use strict';
	const on = ev.on, send = ev.send, need = ev.need, t = tradR.t;

	let validLanguages = [], langPickerId, lang, langData = {}, oldLang, oldLangData;
	let tradLoader;

	//TODO: adapter à gettext et weblate
	// ressources bonus : http://i18next.com/ http://slexaxton.github.io/Jed/ http://l10ns.org/

	function getValidLang() {
		let lang = localStorage.getItem('lang') || navigator.language;
		if (!validLanguages.includes(lang)) lang = lang.substring(0, 2);
		if (!validLanguages.includes(lang)) lang = validLanguages[0];
		return lang;
	}

	function init() {
		listenerInit();
		ev.after(['tradChooser.conf.ok','tradChooser.tradLoader.ok'],()=>{
			send('lang.change', getValidLang());
			send('tradChooser.ready');
		});
		need('config',(config)=>{
			validLanguages = config.trad.supportedLanguages;
			langPickerId = config.trad.langPickerId;
			send('tradChooser.conf.ok');
		});
		need('tradLoader',(tradL)=>{
			tradLoader = tradL;
			send('tradChooser.tradLoader.ok');
		});

	}
	function listenerInit() {
		on('lang.change', updateLangPicker);
		on('lang.change', updateLang);
	}
	function updateLangPicker(lang) {
		const langPicker = htmlTools.buildLangPicker(validLanguages,lang);
		langPicker.addEventListener('change', (e)=>changeLang(e.target.value));
		const anchor = document.getElementById(langPickerId);
		htmlTools.addOrReplace(langPicker,anchor);
	}

	function updateLang(lang) {
		tradLoader.loadTrad(lang);
		// event -> tradChargé -> écouté par tradRenderer pour mettre à jour sa tard.
		//langBrutalSwitch(); // TODO : déplacer dans tradRenderer (et peutêtre rendre moins brutal)
		send('lang.updated', lang);
	}

	function langBrutalSwitch() {
		let allKeys = merge(langData, oldLangData); // allKeys handle partial traductions.
		for (let key in allKeys) if (!oldLangData[key]) allKeys[key] = key;
		let walker = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);
		let node;
		while (node = walker.nextNode()) {
			if (node.data) {
				let text = node.data;
				for (let key in allKeys) text = text.replace(allKeys[key], t(key));
				node.data = text;
			}
			if (node.attributes) {
				for (let i in node.attributes) {
					let attr = node.attributes[i];
					let text = attr.value;
					if (text) for (let key in allKeys) text = text.replace(allKeys[key], t(key));
					if (attr.value !== text) attr.value = text;
				}
			}
		}
	}

	function changeLang(newLang) {
		localStorage.setItem('lang', newLang);
		send(newLang+'.lang.change', newLang);
	}

	return {init}
});
