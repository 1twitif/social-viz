requirejs.config({
		paths: {
			'../node_modules/js-yaml/dist/js-yaml': '//cdnjs.cloudflare.com/ajax/libs/js-yaml/3.6.1/js-yaml.min',
			'../node_modules/d3/build/d3': '//d3js.org/d3.v4.min'
		}
});
requirejs([
		'configLoader',
		'languageLoader',
		'formLoader',
		'graphDataLoader',
		'graph',
		'userInterface'
	], (cfg,langTools, formLoader, gData, graph, ui) => {
	cfg.init();
	langTools.init();
	gData.init();
	formLoader.init();
	ui.init();

	console.log('chargement terminé')
	}
);

