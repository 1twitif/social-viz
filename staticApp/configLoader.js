var options;
// rend globalement accessible la structure options
//Object.defineProperty(window, 'options', new MonitoredStruct(inertOptions,'options'));

(() => {
	const dependencies = [
		'./ymlTools',
		'./urlHashStore',
		'./smartEvents',
		'./MonitoredStruct'

	];
	const libEnv = function (ymlTools,urlHashStore,ev,mStruct) {
		'use strict';
		const on = ev.on, send = ev.send, MonitoredStruct = mStruct.MonitoredStruct;
		let url;
		let config;
		function init(){
			listenerInit();
			ymlTools.loadMerge(['staticApp/appDefault.yml','allData/config.yml'], 'config.default');
		}
		function listenerInit(){
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
		function completeConfigWithUrlHashStore(url){
			const fullConfig = new MonitoredStruct(url.load(),'config');	// init options from url hash
			console.log('send config.ready');
			send('config.ready', fullConfig);
		}
		function storeConfig(config){url.save(config);}

		function setConfig(fullConfig){
			config = fullConfig;
		}
		function getConfig(){
			return config;
		}
		return {
			getConfig,
			init
		}
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();
