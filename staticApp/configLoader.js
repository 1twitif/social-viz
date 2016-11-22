define([
	'./ymlTools',
	'./Store',
	'./smartEvents',
	'./MonitoredStruct'

], (ymlTools, Store, ev, mStruct) => {
	'use strict';
	const on = ev.on, send = ev.send;
	let url;
	let config;

	function init() {
		listenerInit();
		ymlTools.loadMerge(['staticApp/appDefault.yml', 'allData/config.yml'], 'config.default');
	}

	function listenerInit() {
		on('config.default', initUrlHashStore);
		on('urlHashStore.ready', completeConfigWithUrlHashStore);
		on('monitoredStruct.config.delete', 'config.change');
		on('config.change', storeConfig);
		on('config.ready', setConfig);
	}

	function initUrlHashStore(defaultConfig) {
		url = new Store.UrlHashStore(defaultConfig);	// init url with default values
		send('urlHashStore.ready', url);
	}

	function completeConfigWithUrlHashStore(url) {
		const fullConfig = new mStruct.MonitoredStruct(url.load(), 'config');	// init options from url hash
		send('config.ready', fullConfig);
	}

	function storeConfig(config) {
		url.save(config);
	}

	function setConfig(fullConfig) {
		config = fullConfig;
	}

	function getConfig() {
		return config;
	}

	return {
		getConfig,
		init
	}
});
