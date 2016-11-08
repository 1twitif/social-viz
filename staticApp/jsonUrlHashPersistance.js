if (typeof exports === 'undefined') var exports = {};
define(['//d3js.org/d3.v4.min.js', //'node_modules/d3/build/d3.min.js'
		'//cdnjs.cloudflare.com/ajax/libs/js-yaml/3.6.1/js-yaml.min.js',
		'structManipulation'
	],
	function (d3, jsyaml) {
function asyncYmlLoader(sourcesFiles,customEventToSendOrCallBack){
	var filesLoadedCount = 0;
	var filesContents = {};
	var mergedData = {};
	var finalMerge = function(){
		for(var i in sourcesFiles){
			var path = sourcesFiles[i];
			if(typeof filesContents[path] === "object") mergedData = merge(mergedData,filesContents[path]);
		}
		if(typeof customEventToSendOrCallBack === "string") send(customEventToSendOrCallBack, mergedData);
		else if(typeof customEventToSendOrCallBack === "function") customEventToSendOrCallBack(mergedData, sourcesFiles);
	};
	for(var i in sourcesFiles){
		var closure = function(path){
			d3.text(path, function(error, yml){
				if(error) console.log(error);
				filesContents[path] = jsyaml.safeLoad(yml);
				filesLoadedCount++;
				if(sourcesFiles.length === filesLoadedCount) finalMerge();
			});
		};
		closure(sourcesFiles[i]);
	}
}
exports.asyncYmlLoader = asyncYmlLoader;
function Url(defaultState){
	// private attributs
	var referenceState = clone(defaultState);

	// private methods
	var pushInHash = function pushInHash(json,title){
		history.pushState({},title,'#'+JSON.stringify(json));
		dispatchEvent(new HashChangeEvent("hashchange"));
	};
	var replaceHash = function replaceHash(json){
		history.replaceState({},document.title,'#'+JSON.stringify(json));
		dispatchEvent(new HashChangeEvent("hashchange"));
	};
	var jsonFromHash = function jsonFromHash(){
		return window.location.hash?JSON.parse(decodeURIComponent(window.location.hash).substr(1)):{};
	};

	// public methods
	this.load = function load(){
		return merge(referenceState,jsonFromHash());
	};
	this.save = function save(json,newPageTitle){
		var lastState = this.load();
		var newState = removeDefault(merge(lastState,json),referenceState);
		if(newPageTitle) pushInHash(newState,newPageTitle);
		else replaceHash(newState);
	};
}
exports.Url = Url;
return exports;
});
