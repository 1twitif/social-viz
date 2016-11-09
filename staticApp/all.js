requirejs.config({
		paths: {
			'../node_modules/d3/build/d3': '//d3js.org/d3.v4.min',
			'../node_modules/js-yaml/dist/js-yaml': '//cdnjs.cloudflare.com/ajax/libs/js-yaml/3.6.1/js-yaml.min',
		}
});
requirejs([
		'configLoader',
		'languageLoader',
		'graph',
		'userInterface'
	], () => console.log('chargement terminé')
);

