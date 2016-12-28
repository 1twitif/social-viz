define([], () => {
	'use strict';
	let tradData = {}, oldTradData = {};

	function init(){
		//on('trad loaded', setTrad);
	}
	function setTrad(tradMap){
		tradData = tradMap;
		//langBrutalSwitch();
	}
	function t(translateMe) {
		if (tradData[translateMe])
			return tradData[translateMe];
		else return translateMe;
	}

	//FIXME: rendre langBrutalSwith de nouveau fonctionnel
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

	return {
		t,
		setTrad
	}
});
