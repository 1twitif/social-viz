define([
	'./smartEvents',
	'./htmlTools',
	'./tradRenderer',
	'./tradLoader'
], (ev, htmlTools, tradR, tradL) => {
	'use strict';
	const on = ev.on, send = ev.send, need = ev.need, after = ev.after, t = tradR.t;

	let validLanguages = [], lang, langData = {}, oldLang, oldLangData;

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
		need('config',(config)=>{
			validLanguages = config.supportedLanguages;
			send('lang.conf.ok');
		});
		after(['lang.conf.ok'],()=>{
			send('lang.change', getValidLang());
			send('lang.ready');

		})
	}
	function listenerInit() {
		document.getElementById('langPicker').addEventListener('change', changeLang);
		// TODO : langPicker -> radio plutôt que select
		on('lang.change', updateLangPicker);
		on('lang.change', updateLang);
	}
	function updateLangPicker(lang) {
		const htmlLangOptions = document.querySelectorAll('#langPicker option');
		htmlTools.applySelectiveClassOnNodes(htmlLangOptions, 'selected', (n) => n.value === lang);
	}

	function updateLang() {
		oldLang = lang;
		// find language to use in supported ones ( and update langPicker )
		lang = getValidLang();

		// loadLangData
		//FIXME: loader stuff
		if (oldLang !== lang)
			ymlTools.loadMerge([
				"staticApp/lang/" + lang + ".yml",
				"allData/lang/" + lang + ".yml"
			], (data) => {
				applyLocalTrad(data);

			});
		else {
			applyLocalTrad();
			send('lang.update', lang);
		}
	}

	function applyLocalTrad(data) {
		oldLangData = langData;
		let localTrad = loadLocalTrad();
		langData = merge(data || langData, localTrad);
		langBrutalSwitch();
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

	function changeLang(n) {
		const newLang = n.target.value;
		localStorage.setItem('lang', newLang);
		send(newLang+'.lang.change', newLang);
	}

	return {init}
});
