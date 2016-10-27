var lang,langData={}, oldLang, oldLangData;
//TODO: drapeau langue :  https://openclassrooms.com/forum/sujet/image-dans-un-select-10327
//TODO: adapter à gettext et weblate
function updateLang(){
	oldLang = lang;
	// find language to use in supported ones ( and update langPicker )
	lang = localStorage.getItem('lang') || navigator.language;
	var langFound = false;
	d3.selectAll('#langPicker option').property("selected",function(){
		if(this.value === lang) return langFound = true;
		return false;
	});
	if(!langFound) lang = lang.substring(0,2);
	d3.selectAll('#langPicker option').property("selected",function(){
		if(this.value === lang) return langFound = true;
		return false;
	});
	if(!langFound) lang = d3.select('#langPicker').property("value");

	// loadLangData
	if(oldLang !== lang) asyncYmlLoader([
		"staticApp/lang/"+lang+".yml",
		"allData/lang/"+lang+".yml"
	], function(data){
		oldLangData = langData;
		langData = data;
		langBrutalSwitch();
	});
}
updateLang();
function langBrutalSwitch(){
	var allKeys = merge(langData, oldLangData); // allKeys handle partial traductions.
	for(var key in allKeys) if(!oldLangData[key]) allKeys[key] = key;
	var walker = document.createTreeWalker(document,NodeFilter.SHOW_ALL,null,false);
	while(node=walker.nextNode()){
		if(node.data) {
			var text = node.data;
			for(var key in allKeys) text = text.replace(allKeys[key],t(key));
			node.data = text;
		}
		if(node.attributes){
			for(var i in node.attributes) {
				var attr = node.attributes[i];
				var text = attr.nodeValue;
				if(text) for(var key in allKeys) text = text.replace(allKeys[key],t(key));
				attr.nodeValue = text;
			}
		}
	}
}
d3.select('#langPicker').on('change',function(e){
	localStorage.setItem('lang', this.value);
	updateLang();
});
function t(translateMe){
	if(!langData[translateMe]){
		langData[translateMe] = false;
		return translateMe;
	}
	else return langData[translateMe];
}
