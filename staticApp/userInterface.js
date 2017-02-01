define([
	'../node_modules/d3/build/d3',
	'./smartEvents',
	'./trad/trad',
	'./configLoader'
], (d3, ev, trad, cfg) => {
	'use strict';
	const on = ev.on, send = ev.send, t = trad.t;

	function init() {
		listenerInit();
	}

	function listenerInit() {
		on('config.ready', initUI);
		on('config.ready', render);
		on('hashchange', render);
		on('render', updatePanels);
		on('error', displayError);
	}
	function displayError(error){
		let errorBox = getOrCreate('errorBox');
		let errorLine = document.createElement('a');
		errorLine.innerHTML = buildErrorMessage(error);
		errorLine.setAttribute('class','error');
		errorLine.setAttribute('data-timestamp',Date.now());
		errorLine.setAttribute('href','#{"tutorial":"error.'+error.type+'"}');
		errorBox.appendChild(errorLine);
		setTimeout(fadeError,10000);
		setTimeout(fadeError,15000);
	}
	function fadeError(){
		const errors = document.querySelectorAll('#errorBox .error');
		for(let error of errors){
			if(error.getAttribute('data-timestamp')<Date.now()-10000 && !error.classList.contains('fade'))
				error.classList.add('fade');
			if(error.getAttribute('data-timestamp')<Date.now()-15000)
				error.parentNode.removeChild(error);
		}
	}
	const errorMessageBuilderCatalog = {};
	errorMessageBuilderCatalog["file.load.error.404"] = (error)=>{
		if(error.value.indexOf('allData') !== -1){
			return t('error 404, file not found : ')+'allData'+error.value.split('allData')[1];
		}
		return t('error 404, file not found : ')+error.value;
	};
	errorMessageBuilderCatalog["default"] = (error) => 'error : '+JSON.stringify(error);
	function buildErrorMessage(error){
		if(errorMessageBuilderCatalog[error.type]) return errorMessageBuilderCatalog[error.type](error);
		else return errorMessageBuilderCatalog['default'](error);
	}
	function getOrCreate(id){
		let node = document.getElementById(id);
		if(!node){
			node = document.createElement('div');
			node.setAttribute('id',id);
			document.body.appendChild(node);
		}
		return node;
	}
	function render() {
		send('render', cfg.getConfig());
	}

	d3.selectAll('.expand').on('click', expandPanel);
	d3.selectAll('.reduce').on('click', reducePanel);

	function expandPanel() {
		slidePanel({'hidden': 'small', 'small': 'big'});
	}

	function reducePanel() {
		slidePanel({'big': 'small', 'small': 'hidden'});
	}

	function slidePanel(nextStatePicker) {
		// met à jour l'état de l'app en modifiant la config
		let panelNode = d3.event.target.parentNode;
		cfg.getConfig().panels[panelNode.id] = nextStatePicker[panelNode.className];
	}


	function updatePanels(config) {
		let panelsMoved = false;
		for (let i in config.panels) {
			let node = d3.select('#' + i);
			let alreadyClassed = node.classed(config.panels[i]);
			if (!alreadyClassed) {
				node.node().className = config.panels[i];
				panelsMoved = true;
			}
		}
		if (panelsMoved) send('resize');
	}

	function initUI(config) {
		//TODO: gérer les layersGroups
		if(! config.nodeLayers) config.nodeLayers = {};
		if(! config.hideLayers) config.hideLayers = {};
		let legendArea = d3.select('#legend>section');
		// TODO : utiliser des requêtes pour sélectionné ce qui fait partie d'un layer
		let legend = legendArea.selectAll('label.layer').data(config.nodeLayers).enter()
			.append("label")
			.attr("class", "layer")
			.attr("id", function (l) {
				return 'nl' + l.id; //nl -> nodeLayer
			}).on('mouseover', partialHideNotConcerned)
			.on('mouseout', unhideAll);
		legend.append("img")
			.attr("class", "picto")
			.attr("src", function (l) {
				return l.picto;
			})
		;
		legend.append("input")
			.attr("type", "checkbox")
			.attr("value", function (l) {
				return l.id;
			})
			.property("checked", function (l) {
				return !config.hideLayers['nl' + l.id];
			})
		;
		legend.append("span").text(function (l) {
			return t(l.label);
		});
	}

	function partialHideNotConcerned(e) {
		d3.selectAll('.node, .link').classed('nearlyHidden', true);
		d3.selectAll('.node.nl' + e.id).classed('nearlyHidden', false);
	}

	function unhideAll(e) {
		d3.selectAll('.node, .link').classed('nearlyHidden', false);
	}

	return {init};
});
