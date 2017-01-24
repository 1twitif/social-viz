define([
	'./smartEvents',
	'./structManipulation',
	'./Store',
	'./ymlTools',
	'./keyRecorder',
	'./MonitoredStruct'
], (ev, struct, Store, ymlTools, keyRecorder, mStruct) => {
	'use strict';
	const on = ev.on, send = ev.send;

	let langsData = {},activeTradData, activeTradSaveListener;
	const localStore = {}, tradPaths = [];
	function reset(){
		langsData = {};
		activeTradData = undefined;
		activeTradSaveListener = undefined;
		for(let i in localStore) delete localStore[i];
		while(tradPaths.length) tradPaths.pop();
	}

	function init(config){
		if(!config) return ev.need('config',init);
		if (config.trad && config.trad.traductionFilesPaths)
			for(let tradFilePath of config.trad.traductionFilesPaths) setTradPath(tradFilePath);
		ev.give('tradLoader', { loadTrad, getTradData } );
		send('tradLoader.conf.ok');
	}

	function setTradPath(tradPath){
		tradPaths.push(tradPath);
	}
	function loadTrad(lang) {
		if(!tradPaths.length){
			localStore[lang] = new Store.LocalStore({},'trad.'+lang);
			langsData[lang] = {};
		}
		if(langsData[lang]){
			langsData[lang] = mergeWithLocalTrad(langsData[lang],lang);
			buildActiveTradData(langsData[lang]);

			if(activeTradSaveListener) activeTradSaveListener.destroy();
			activeTradSaveListener = on('trad change',(trad)=>localStore[lang].save(trad));

			send('trad.'+lang+'.loaded', activeTradData);
		}
		else {
			const tradFiles = tradPaths.map( (path) => path+lang+".yml" );
			ymlTools.loadMerge(tradFiles,
				(data) => {
				langsData[lang] = data;
				localStore[lang] = new Store.LocalStore(data,'trad.'+lang);

				loadTrad(lang);
			});
		}
	}
	function buildActiveTradData(tradData){
		activeTradData = new keyRecorder.KeyRecorder( new mStruct.MonitoredStruct(tradData,'trad') );
	}

	function mergeWithLocalTrad(existingData,lang) {
		let localTrad = localStore[lang].load();
		return struct.merge(existingData, localTrad); //FIXME: merge superflux ?
	}
	function getTradData(){
		return activeTradData;
	}
	return { init, reset, loadTrad, getTradData };
});
