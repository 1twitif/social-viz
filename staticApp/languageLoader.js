var lang,langData={}, oldLang, oldLangData;
//TODO: drapeau langue :  https://openclassrooms.com/forum/sujet/image-dans-un-select-10327
//TODO: adapter à gettext et weblate
// ressources bonus : http://i18next.com/ http://slexaxton.github.io/Jed/ http://l10ns.org/
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
	//if(oldLang !== lang)
	asyncYmlLoader([
		"staticApp/lang/"+lang+".yml",
		"allData/lang/"+lang+".yml"
	], function(data){
		oldLangData = langData;
		var localTrad = loadLocalTrad();
		langData = merge(data,localTrad);
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
				var text = attr.value;
				if(text) for(var key in allKeys) text = text.replace(allKeys[key],t(key));
				attr.value = text;
			}
		}
	}
}
d3.select('#langPicker').on('change',function(e){
	localStorage.setItem('lang', this.value);
	updateLang();
	updateDetails(); //TODO : envoyer et consomer des évènement pour éviter le couplage fort
});
function t(translateMe){
	if(!langData[translateMe]){
		langData[translateMe] = '';
		return translateMe;
	}
	else return langData[translateMe];
}
d3.select('#editTrad').on('click',function(){
	options.userMode="trad";
	options.selected=undefined;
	url.save(options);
});
function renderTradForm(){
	var formStr = '<form id="tradForm">';
	for(var key in langData){
		formStr+='<label>'+key+'<input name="'+key+'" value="'+langData[key]+'" onchange="saveLocalTrad(this)"/></label>';
	}
	formStr+='<a id="trad2file" class="button" download="'+lang+'.yml">Sauvegarder le fichier de langue complet</a>';
	formStr+='<a class="button" onclick="updateLang()">Appliquer localement</a>';
	formStr+='</form>';
	var details = document.querySelector("#details section");
	details.innerHTML = formStr;
	updateSaveTradButton(langData);
}
function loadLocalTrad(){
	var localTrad = jsyaml.safeLoad(localStorage.getItem('trad.'+lang));
	return localTrad || {};
}
function saveLocalTrad(e){
	var localTrad = loadLocalTrad();
	localTrad[e.name]=e.value;
	localStorage.setItem('trad.'+lang,jsyaml.safeDump(localTrad));
	updateSaveTradButton(merge(langData,localTrad));
}
function updateSaveTradButton(trad){
	var saveButton = document.getElementById('trad2file');
	saveButton.href = 'data:text/yaml;charset=utf-8,'+encodeURIComponent(jsyaml.safeDump(trad));
	//console.log(saveButton.href);
}
