define([
	'../node_modules/js-yaml/dist/js-yaml',
	'./ymlTools',
	'./structManipulation',
	'./smartEvents',
	'./configLoader'
], (jsyaml, ymlTools, struct, ev, cfg) => {
	'use strict';
	const on = ev.on, send = ev.send, merge = struct.merge;

	const validLanguages = ['en', 'fr', 'es']; // TODO : import from options
	let lang, langData = {}, oldLang, oldLangData;
	//TODO: drapeau langue :  https://openclassrooms.com/forum/sujet/image-dans-un-select-10327
	//TODO: adapter à gettext et weblate
	// ressources bonus : http://i18next.com/ http://slexaxton.github.io/Jed/ http://l10ns.org/
	function applySelectiveClassOnNodes(nodes, className, condition) {
		let appliedTimes = 0;
		for (let i in nodes) {
			if (nodes.hasOwnProperty(i)) {
				const n = nodes[i];
				if (condition(n)) {
					appliedTimes++;
					n.classList.add(className);
				} else n.classList.remove(className);
			}
		}
		return appliedTimes;
	}

	function getValidLang() {
		let lang = localStorage.getItem('lang') || navigator.language;
		if (!validLanguages.includes(lang)) lang = lang.substring(0, 2);
		if (!validLanguages.includes(lang)) lang = 'en';
		return lang;
	}

	function initLang() {
		let node = document.getElementById('langPicker');
		if (node) node.addEventListener('change', changeLang);
		node = document.getElementById('editTrad');
		if (node) node.addEventListener('click', activateUserModeTrad);
		send('lang.change', getValidLang());
	}

	on('lang.change', updateLangPicker);
	function updateLangPicker(lang) {
		const htmlLangOptions = document.querySelectorAll('#langPicker option');
		applySelectiveClassOnNodes(htmlLangOptions, 'selected', (n) => n.value === lang);
	}

	on('lang.change', updateLang);
	function updateLang() {
		oldLang = lang;
		// find language to use in supported ones ( and update langPicker )
		lang = getValidLang();

		// loadLangData
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
		localStorage.setItem('lang', n.target.value);
		send('lang.change', n.target.value);
	}

	function t(translateMe) {
		if (!langData[translateMe]) {
			langData[translateMe] = '';
			return translateMe;
		}
		else return langData[translateMe];
	}

	function activateUserModeTrad() {
		const config = cfg.getConfig();
		config.userMode = "trad";
	}

	function renderTradForm() {
		let formStr = '<form id="tradForm">';
		for (let key in langData) {
			formStr += '<label>' + key + '<input name="' + key + '" value="' + langData[key] + '" onchange="saveLocalTrad(this)"/></label>';
		}
		formStr += '<a id="trad2file" class="button" download="' + lang + '.yml">Sauvegarder le fichier de langue complet</a>';
		formStr += '<a class="button" onclick="updateLang()">Appliquer localement</a>';
		formStr += '</form>';
		let details = document.querySelector("#details section");
		details.innerHTML = formStr;
		updateSaveTradButton(langData);
	}

	function loadLocalTrad() {
		let localTrad = jsyaml.safeLoad(localStorage.getItem('trad.' + lang));
		return localTrad || {};
	}

	function saveLocalTrad(e) {
		let localTrad = loadLocalTrad();
		localTrad[e.name] = e.value;
		localStorage.setItem('trad.' + lang, jsyaml.safeDump(localTrad));
		updateSaveTradButton(merge(langData, localTrad));
	}

	function updateSaveTradButton(trad) {
		let saveButton = document.getElementById('trad2file');
		saveButton.href = 'data:text/yaml;charset=utf-8,' + encodeURIComponent(jsyaml.safeDump(trad));
	}

	return {
		'init': initLang,
		t,
		renderTradForm //FIXME: éviter d'avoir à exposer ça.
	}
});
