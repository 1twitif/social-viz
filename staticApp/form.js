define([
	'./smartEvents',
	'../node_modules/js-yaml/dist/js-yaml',
	'./configLoader',
	'./structManipulation',
	'./MonitoredStruct',
], (ev, jsyaml, cfg) => {
	'use strict';
	const on = ev.on, send = ev.send;
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes
function Form (yml, graphData,id){
	const config = cfg.getConfig();
	this.template = jsyaml.safeLoad(yml);
	this.graph = graphData;
	let entityId = id;

	this.edit = function edit(id){
		entityId = id;
		// send event ou refresh render directe
	};

	this.render = function render(targetNode){
		// datalist http://www.alsacreations.com/article/lire/1334-html5-element-datalist.html
	}
}

	return {Form};
});
