var url, options={};

(() => {
	const dependencies = [
		'./ymlTools',
		'./urlHashStore',
		'./eventShortcut'
	];
	const libEnv = function (ymlTools,urlHashStore,ev) {
		'use strict';
		const on = ev.on, send = ev.send;

		ymlTools.loadMerge([
			"staticApp/appDefault.yml",
			"allData/config.yml"
		], function(data){
			options = data;
			url = new urlHashStore.Url(options);	// init url with default values
			options = url.load();	// init options from url hash
			send('configReady', options);
		});

// options stuff
		on('optionsChanged', saveOptions);
		function saveOptions(opt){url.save(opt);}

// TODO : utiliser un Proxy pour déclancher les evenement OptionsChanged https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Proxy


		return {
		}
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();
