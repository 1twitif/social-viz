define([
	'./form',
	'./smartEvents',
	'./ymlTools',
	'./configLoader'
], (formLib, ev, ymlTools,cfg) => {
	'use strict';
	const on = ev.on, send = ev.send;

	let readyToUseForm;
	function init(){
		readyToUseForm = new formLib.Form();
		listenerInit();
		on('yml.ready',(e)=>(e.filename==='allData/form.yml')?send('form.template.ready',e.yml):0 );
		ymlTools.load('allData/form.yml');

		const node = document.getElementById('editionMode');
		if (node) node.addEventListener('click', activateEditorMode);
	}
	function listenerInit() {
		on('config.ready', readyToUseForm.setConfig);
		on('data.ready', readyToUseForm.setData);
		on('form.template.ready', readyToUseForm.setTemplate);

	}
	function activateEditorMode() {
		const config = cfg.getConfig();
		config.userMode = "edit";
	}
	function getForm(){
		return readyToUseForm;
	}

	return {init, getForm}
});
