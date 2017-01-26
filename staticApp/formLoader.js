define([
	'./form',
	'./smartEvents',
	'./ymlTools'
], (formLib, ev, ymlTools) => {
	'use strict';
	const on = ev.on, send = ev.send;

	let readyToUseForm, config;
	function init(){
		ev.after(["config.ready",'data.ready','form.template.ready'],()=>{
			chooseToDisplayForm();
		});
		ev.need("config", (cfg)=> config=cfg );
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
		ev.on("config.userMode change", chooseToDisplayForm);
	}
	function activateEditorMode() {
		config.userMode = "edit";
	}
	function chooseToDisplayForm(){
		if (config.userMode === "edit") displayForm();
	}
	function displayForm(){
		const anchor = document.querySelector("#details section");
		const form = getForm();
		form.edit(config.selected);
		form.displayInNode(anchor);
		console.log(anchor);
		console.log(config.selected);
	}

	function getForm(){
		return readyToUseForm;
	}

	return {init, getForm}
});
