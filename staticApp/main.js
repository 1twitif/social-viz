requirejs.config({
		paths: {
			'../node_modules/js-yaml/dist/js-yaml': '//cdnjs.cloudflare.com/ajax/libs/js-yaml/3.6.1/js-yaml.min',
			'../node_modules/d3/build/d3': '//d3js.org/d3.v4.min'
		}
});
requirejs([
		"smartEvents",
		'configLoader',
		'./trad/trad',
		'formLoader',
		'graphDataLoader',
		'graph',
		'userInterface'
	], (ev, cfg,trad, formLoader, gData, graph, ui) => {
	console.log('chargement des fichiers js terminé');
	ev.need('config',(c)=>console.log("config diffusée : ",c));
	ev.on("lang.change", (lang)=>console.log("langue active : ",lang));
	ev.on("trad.applied", ()=>console.log("traduction appliquée"));
	ev.need('graph.data',(d)=>console.log("données du graph disponnible : ",d));
	cfg.init();
	trad.init();
	gData.init();
	formLoader.init();
	ui.init();
	console.log('initialisation terminé');

	//console.log('config diffusée'); (catch init event mais si chargé trop tard, va demander après coup lors de l'évènement disant que tout est chargé)
	}
);

