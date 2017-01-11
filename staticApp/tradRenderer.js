define(['./smartEvents', './structManipulation'], (ev,struct) => {
	'use strict';
	let tradData = {}, oldTradData = {};

	function reset(){
		tradData = {};
		oldTradData = {};
	}

	function init(){
		ev.on('trad loaded', (tradMap)=>{
			setTrad(tradMap);
			refreshTrad();
		});
	}
	function setTrad(tradMap){
		oldTradData = tradData;
		tradData = tradMap;
	}
	function t(translateMe) {
		if (tradData[translateMe])
			return tradData[translateMe];
		else return translateMe;
	}

	//FIXME: rendre langBrutalSwith de nouveau fonctionnel
	function refreshTrad() { // ex langBrutalSwitch
		let allKeys = struct.merge(tradData, oldTradData); // allKeys handle partial traductions.
		for (let key in allKeys) if (!oldTradData[key]) allKeys[key] = key;
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

					if(attr.name === "class" || attr.name === "id" || attr.name === "type") continue;
					let text = attr.value;
					if (text) for (let key in allKeys) text = text.replace(allKeys[key], t(key));
					if (attr.value !== text) attr.value = text;
				}
			}
		}
	}

	return {
		init,
		reset,
		t
	}
});
