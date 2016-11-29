define([
	'./smartEvents',
	'./structManipulation'
], (ev, struct) => {
	'use strict';
	const send = ev.send;

	function MonitoredStruct(inertStruct, eventNameSuffix, topAncestor) {
		this.topAncestor = topAncestor ? topAncestor : this;
		const closuredTopAncestor = this.topAncestor;
		const handler = {
			'set': (obj, key, value) => {
				if(JSON.stringify(obj[key]) === JSON.stringify(value) ) return true;
				if (typeof value === 'object') obj[key] = new MonitoredStruct(value, eventNameSuffix+'.'+key, closuredTopAncestor);
				else obj[key] = value;
				send(structureEventName(['monitoredStruct', 'change', eventNameSuffix+'.'+key]), closuredTopAncestor.smartObj);
				return true;
			},
			'deleteProperty': function (obj, key) {
				send(structureEventName(['monitoredStruct', 'delete', eventNameSuffix+'.'+key]), closuredTopAncestor.smartObj);
				return delete obj[key];
			}
		};
		let goSmart = struct.clone(inertStruct);
		for (let key in inertStruct) {
			if (typeof inertStruct[key] === 'object') {
				goSmart[key] = new MonitoredStruct(inertStruct[key], eventNameSuffix+'.'+key, this.topAncestor);
			} else goSmart[key] = inertStruct[key];
		}
		this.smartObj = new Proxy(goSmart, handler);
		return this.smartObj;
	}

	function structureEventName(optionalPartsArray) {
		return optionalPartsArray.filter((part) => !!part).join('.');
	}

	function unOverwritableGlobalConst(name, value) {
		Object.defineProperty(window, name, {'value': value});
	}

	return {MonitoredStruct, unOverwritableGlobalConst}
});
