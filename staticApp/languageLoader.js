(() => {
	const dependencies = [
		'../node_modules/d3/build/d3',
		'../node_modules/js-yaml/dist/js-yaml',
		'./ymlTools',
		'./structManipulation',
		'./eventShortcut'
	];
	const libEnv = function (d3, jsyaml, ymlTools, struct, ev) {
		'use strict';
		const on = ev.on, send = ev.send, merge = struct.merge;

		let lang, langData = {}, oldLang, oldLangData;
		//TODO: drapeau langue :  https://openclassrooms.com/forum/sujet/image-dans-un-select-10327
		//TODO: adapter à gettext et weblate
		// ressources bonus : http://i18next.com/ http://slexaxton.github.io/Jed/ http://l10ns.org/
		function updateLang() {
			oldLang = lang;
			// find language to use in supported ones ( and update langPicker )
			lang = localStorage.getItem('lang') || navigator.language;
			let langFound = false;
			d3.selectAll('#langPicker option').property("selected", function () {
				if (this.value === lang) return langFound = true;
				return false;
			});
			if (!langFound) lang = lang.substring(0, 2);
			d3.selectAll('#langPicker option').property("selected", function () {
				if (this.value === lang) return langFound = true;
				return false;
			});
			if (!langFound) lang = d3.select('#langPicker').property("value");

			// loadLangData
			//if(oldLang !== lang)
			ymlTools.loadMerge([
				"staticApp/lang/" + lang + ".yml",
				"allData/lang/" + lang + ".yml"
			], function (data) {
				oldLangData = langData;
				let localTrad = loadLocalTrad();
				langData = merge(data, localTrad);
				langBrutalSwitch();
			});
		}

		updateLang();
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

		d3.select('#langPicker').on('change', function (e) {
			localStorage.setItem('lang', this.value);
			updateLang();
			updateDetails(); //TODO : envoyer et consomer des évènement pour éviter le couplage fort
		});
		function t(translateMe) {
			if (!langData[translateMe]) {
				langData[translateMe] = '';
				return translateMe;
			}
			else return langData[translateMe];
		}

		d3.select('#editTrad').on('click', function () {
			options.userMode = "trad";
			options.selected = undefined;
			url.save(options);
		});
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
			//console.log(saveButton.href);
		}

		return {
			t,
			renderTradForm //FIXME: éviter d'avoir à exposer ça.
		}
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();
