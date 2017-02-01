define(['../smartEvents', '../structManipulation'], (ev, struct) => {
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
		return tradData[translateMe] ? tradData[translateMe] : translateMe ;
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
		ev.send("trad.applied");
	}
	function refreshTextTrad(node, allKeys) {
		if (node.data) {
			node.data = multiTranslate(node.data,allKeys);
		}
	}
	function refreshAttributesTrad(node, allKeys) {
		if (node.attributes) {
			for (let attr of node.attributes) {
				if (attr.name === "class" || attr.name === "id" || attr.name === "type") continue;
				let text = multiTranslate(attr.value,allKeys);
				if (attr.value !== text) attr.value = text;
			}
		}
	}
	function multiTranslate(translateMe,detectionList){
		if (translateMe) for (let key in detectionList) translateMe = translateMe.replace(detectionList[key], t(key));
		return translateMe;
	}

	return {
		init,
		reset,
		t
	}
});
