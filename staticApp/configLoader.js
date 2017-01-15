define([
	'./ymlTools',
	'./Store',
	'./smartEvents',
	'./MonitoredStruct'

], (ymlTools, Store, ev, mStruct) => {
	'use strict';
	const on = ev.on, send = ev.send;
	let urlHashStore;
	let config;

	function reset(){
		urlHashStore = false;
		config = false;
	}
	function init() {
		listenerInit();
		ymlTools.loadMerge(['staticApp/appDefault.yml', 'allData/config.yml'], 'config.default');
	}

	function listenerInit() {
		on('config.default', initUrlHashStore);
		on('urlHashStore.ready', completeConfigWithUrlHashStore);
		on('config delete', 'config.change');
		on('config change', storeConfig);
	}

	function initUrlHashStore(defaultConfig) {
		urlHashStore = new Store.UrlHashStore(defaultConfig);	// init url with default values
		send('urlHashStore.ready', urlHashStore);
	}

	function completeConfigWithUrlHashStore(url) {
		const fullConfig = new mStruct.MonitoredStruct(url.load(), 'config');	// init options from url hash
		setConfig(fullConfig);
		ev.give("config",getConfig);
	}

	function storeConfig(config) {
		urlHashStore.save(config);
	}

	function setConfig(fullConfig) {
		config = fullConfig;
	}

	function getConfig() {
		return config;
	}

	return {
		reset,
		init,
		getConfig
	}
});
