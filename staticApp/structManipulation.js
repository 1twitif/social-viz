if (typeof exports === 'undefined') var exports = {};
function clone(json){
	return JSON.parse(JSON.stringify(json))
}
exports.clone = clone;
function merge(baseJson,overwritingJson){
	var res = clone(baseJson);
	for (var key in overwritingJson) {
		if(typeof overwritingJson[key] === "object" && typeof res[key] !== 'undefined') {
			res[key] = merge(res[key],overwritingJson[key]);
		}
		else res[key] = overwritingJson[key];
	}
	return res;
}
exports.merge = merge;
function isEmpty(thing){
	if(thing === 0) return false;
	if(typeof thing !== "object") return !thing;
	return JSON.stringify(thing) === '{}' || JSON.stringify(thing) === '[]';
}
function cleanJson(json){
	if(Array.isArray(json)){
		for (var i=json.length-1;i>=0;i--) {
			if (typeof json[i] === 'object') json[i] = cleanJson(json[i]);
			if (isEmpty(json[i])) json.splice(i,1);
		}
	}
	else for (var key in json) {
		if (typeof json[key] === 'object') json[key] = cleanJson(json[key]);
		if (isEmpty(json[key])) delete json[key];
	}
	return json;
}
exports.cleanJson = cleanJson;
function removeDefault(json,defaultJson){
	var res = clone(json);
	for (var key in defaultJson) {
		if(typeof defaultJson[key] === "object" && typeof res[key] !== 'undefined') {
			var subRes = removeDefault(res[key],defaultJson[key]);
			res[key] = subRes;
		}
		if(JSON.stringify(defaultJson[key])===JSON.stringify(res[key])) delete res[key];
	}
	return cleanJson(res);
}
exports.removeDefault = removeDefault;
