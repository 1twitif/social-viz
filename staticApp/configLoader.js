define([
	'./ymlTools',
	'./urlHashStore',
	'./smartEvents',
	'./MonitoredStruct'

], (ymlTools, urlHashStore, ev, mStruct) => {
	'use strict';
	const on = ev.on, send = ev.send, MonitoredStruct = mStruct.MonitoredStruct;
	let url;
	let config;

	function init() {
		listenerInit();
		ymlTools.loadMerge(['staticApp/appDefault.yml', 'allData/config.yml'], 'config.default');

		//FIXME : Debug :
		on('yml.ready',(e)=>(e.filename==='allData/form.yml')?console.log(e.yml):0 );
		ymlTools.load('allData/form.yml');
	}

	function listenerInit() {
		on('config.default', initUrlHashStore);
		on('urlHashStore.ready', completeConfigWithUrlHashStore);
		on('monitoredStruct.change.config', 'config.change');
		on('monitoredStruct.delete.config', 'config.change');
		on('config.change', storeConfig);
		on('config.ready', setConfig);
	}

	function initUrlHashStore(defaultConfig) {
		url = new urlHashStore.Url(defaultConfig);	// init url with default values
		send('urlHashStore.ready', url);
	}

	function completeConfigWithUrlHashStore(url) {
		const fullConfig = new MonitoredStruct(url.load(), 'config');	// init options from url hash
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
