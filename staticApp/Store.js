define([
	'./structManipulation'
], (struct) => {
	'use strict';
	function localGet(storeId) {
		return JSON.parse(localStorage.getItem(storeId)) || {};
	}
	function localSet(storeId,data) {
		localStorage.setItem(storeId,JSON.stringify(data));
	}
	function urlHashGet(storeId) {
		if(!storeId) return location.hash ? JSON.parse(decodeURIComponent(location.hash).substr(1)) : {};
		return location.hash ? JSON.parse(decodeURIComponent(location.hash).substr(1))[storeId] : {};
	}
	function urlHashSet(storeId,data) {
		let hashData;
		if(storeId) {
			hashData = urlHashGet();
			hashData[storeId] = data;
		} else hashData = data;
		history.replaceState({}, document.title, '#' + JSON.stringify(hashData));
		dispatchEvent(new HashChangeEvent("hashchange"));
	}

	function Store(defaultState, storeId, safeGet, safeSet) {
		const referenceState = struct.clone(defaultState);
		this.load = function load() {
			return struct.cleanJson(struct.merge(referenceState, safeGet(storeId)));
		};
		this.save = function save(json) {
			const newState = struct.diff(referenceState,json);
			safeSet(storeId,newState);
		};
	}
	function LocalStore(defaultState,storeId){
		this.store = new Store(defaultState,storeId,localGet,localSet);
		return this.store;
	}
	function UrlHashStore(defaultState,storeId){
		this.store = new Store(defaultState,storeId,urlHashGet,urlHashSet);
		return this.store;
	}
	return {
		Store,
		LocalStore,
		UrlHashStore
	}
});
