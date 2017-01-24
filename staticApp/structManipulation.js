define([], () => {
	'use strict';

	function clone(json) {
		return JSON.parse(JSON.stringify(json))
	}

	function merge(baseJson, overwritingJson) {
		if(typeof baseJson !== "object") return clone(overwritingJson);
		let res = clone(baseJson);
		for (let key in overwritingJson) {
			if (typeof overwritingJson[key] === "object" && typeof res[key] !== 'undefined') {
				res[key] = merge(res[key], overwritingJson[key]);
			}
			else res[key] = overwritingJson[key];
		}
		return res;
	}

	function mergeInOrder(orderedKey, map) {
		let mergedData = {};
		for (let key of orderedKey) mergedData = merge(mergedData, map[key]);
		return mergedData;
	}

	function isNullEmpty(thing) {
		if(thing === null) return true;
		return isEmpty(thing);
	}
	function isEmpty(thing) {
		if (thing === 0 || thing === false) return false;
		if (typeof thing !== "object") return !thing;
		return JSON.stringify(thing) === '{}' || JSON.stringify(thing) === '[]';
	}

	function cleanJson(json) {
		if(json === null) return json;
		if(typeof json !== "object") return json;
		if (Array.isArray(json)) cleanArray(json);
		else cleanObject(json);
		return json;
	}
	function cleanArray(array){
		for (let i = array.length - 1; i >= 0; i--) {
			if (typeof array[i] === 'object') array[i] = cleanJson(array[i]);
			if (isNullEmpty(array[i])) array.splice(i, 1);
		}
	}
	function cleanObject(obj){
		for (let key in obj) {
			if (typeof obj[key] === 'object') obj[key] = cleanJson(obj[key]);
			if (isNullEmpty(obj[key])) delete obj[key];
		}
	}

	function removeDefault(json, defaultJson) {
		let res = clone(json);
		for (let key in defaultJson) {
			if (typeof defaultJson[key] === "object" && typeof res[key] !== 'undefined') {
				res[key] = removeDefault(res[key], defaultJson[key]);
			}
			if (JSON.stringify(defaultJson[key]) === JSON.stringify(res[key])) delete res[key];
		}
		return cleanJson(res);
	}
	function diff(refJson,newJson) {
		const res = Array.isArray(refJson) ? [] : {};
		for (let key in newJson) {
			if (typeof newJson[key] === "object" && typeof refJson[key] === 'object') {
				let subRes = diff(refJson[key], newJson[key]);
				if(!isEmpty(subRes)) res[key] = subRes;
			} else if(newJson[key] !== refJson[key]) res[key] = newJson[key];
		}
		diffDeletionPass(refJson,newJson,res);
		return res;
	}
	function diffDeletionPass(refJson,newJson,res) {
		for (let key in refJson) {
			if(isEmpty(newJson[key])) res[key] = null;
		}
	}

	return {
		clone,
		merge,
		mergeInOrder,
		cleanJson,
		removeDefault,
		diff
	}
});
