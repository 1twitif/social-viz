define([
	'./form',
	'./smartEvents',
	'./ymlTools',
	'./htmlTools'
], (formLib, ev, ymlTools, htmlTools) => {
	'use strict';
	const on = ev.on, send = ev.send, buildNode = htmlTools.buildNode;

	let readyToUseForm, config;
	function init(){
		readyToUseForm = new formLib.Form();
		ev.need("config",readyToUseForm.setConfig);
		ev.need("fullGraph",readyToUseForm.setData);

		ev.after(["formLoader.config.ok",'formLoader.fullGraph.ok','form.template.ready'],()=>{
			chooseToDisplayForm();
			console.log("formReady");
		});
		ev.need("fullGraph", "formLoader.fullGraph.ok");
		ev.need("config", "formLoader.config.ok");
		ev.need("config", (cfg)=> config=cfg );


		listenerInit();
		on('yml.ready',(e)=>(e.filename==='allData/form.yml')?send('form.template.ready',e.yml):0 );
		ymlTools.load('allData/form.yml');

		ev.on("mainToolsView.ready",()=>bindButton('editModeButton',activateEditorMode));
		bindButton('editModeButton',activateEditorMode);//FIXME: ça devrait être dans la config ça !
	}
	function bindButton(id,action){
		const node = document.getElementById(id);
		if (node) node.addEventListener('click', action);
	}
	function listenerInit() {
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
		const anchor = document.querySelector("#details"); //FIXME go config !
		const header = buildNode(".header");
		header.appendChild(buildNode('h2','form_title'));

		const formAnchor = buildNode("section.wrapper");

		anchor.innerHTML = "";
		anchor.appendChild(header);
		anchor.appendChild(formAnchor);
		anchor.appendChild(buildNode('button.reduce','-'));
		anchor.appendChild(buildNode('button.expand','+'));

		const form = getForm();
		form.edit(config.selected);
		form.displayInNode(formAnchor);
		ev.send("formView.rendered");
	}

	function getForm(){
		return readyToUseForm;
	}

	return {init, getForm}
});
