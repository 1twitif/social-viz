define([
	'../node_modules/d3/build/d3',
	'./smartEvents',
	'./languageLoader',
	'./configLoader'
], (d3, ev, langTools, cfg) => {
	'use strict';
	const on = ev.on, send = ev.send, t = langTools.t;

	function init() {
		listenerInit();
	}

	function listenerInit() {
		on('config.ready', initUI);
		on('config.ready', render);
		on('hashchange', render);
		on('render', updatePanels);
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
		let legendArea = d3.select('#legend>section');
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
