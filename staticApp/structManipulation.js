define([], () => {
	'use strict';

	function clone(json) {
		return JSON.parse(JSON.stringify(json))
	}

	function merge(baseJson, overwritingJson) {
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
		for (let i in orderedKey) {
			let key = orderedKey[i];
			if (typeof map[key] === "object") mergedData = merge(mergedData, map[key]);
		}
		return mergedData;
	}

	function isEmpty(thing) {
		if (thing === 0) return false;
		if (typeof thing !== "object") return !thing;
		return JSON.stringify(thing) === '{}' || JSON.stringify(thing) === '[]';
	}

	function cleanJson(json) {
		if (Array.isArray(json)) {
			for (let i = json.length - 1; i >= 0; i--) {
				if (typeof json[i] === 'object') json[i] = cleanJson(json[i]);
				if (isEmpty(json[i])) json.splice(i, 1);
			}
		}
		else for (let key in json) {
			if (typeof json[key] === 'object') json[key] = cleanJson(json[key]);
			if (isEmpty(json[key])) delete json[key];
		}
		return json;
	}

	function removeDefault(json, defaultJson) {
		let res = clone(json);
		for (let key in defaultJson) {
			if (typeof defaultJson[key] === "object" && typeof res[key] !== 'undefined') {
				let subRes = removeDefault(res[key], defaultJson[key]);
				res[key] = subRes;
			}
			if (JSON.stringify(defaultJson[key]) === JSON.stringify(res[key])) delete res[key];
		}
		return cleanJson(res);
	}

	return {
		clone,
		merge,
		mergeInOrder,
		cleanJson,
		removeDefault
	}
});
