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

	function refreshTrad() {
		let allKeys = struct.merge(tradData, oldTradData); // allKeys handle partial traductions.
		for (let key in allKeys) if (!oldTradData[key]) allKeys[key] = key;
		let walker = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);
		let node;
		while (node = walker.nextNode()) {
			refreshTextTrad(node, allKeys);
			refreshAttributesTrad(node, allKeys);
		}
	}
	function refreshTextTrad(node, allKeys) {
		if (node.data) {
			let text = node.data;
			for (let key in allKeys) text = text.replace(allKeys[key], t(key));
			node.data = text;
		}
	}
	function refreshAttributesTrad(node, allKeys) {
		if (node.attributes) {
			for (let i in node.attributes) {
				let attr = node.attributes[i];

				if (attr.name === "class" || attr.name === "id" || attr.name === "type") continue;
				let text = attr.value;
				if (text) for (let key in allKeys) text = text.replace(allKeys[key], t(key));
				if (attr.value !== text) attr.value = text;
			}
		}
	}

	return {
		init,
		reset,
		t
	}
});
