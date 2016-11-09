(() => {
	const dependencies = [
		'../node_modules/d3/build/d3',
		'./eventShortcut',
		'languageLoader',
		'configLoader'
	];
	const libEnv = function (d3, ev,langTools) {
		'use strict';
		const on = ev.on, send = ev.send, t = langTools.t;

		on('hashchange', render);
		on('configReady', render);
		on('configReady', initUI);
		d3.selectAll('.expand').on('click', expandPanel);
		d3.selectAll('.reduce').on('click', reducePanel);

		function expandPanel() { slidePanel({'hidden': 'small', 'small': 'big'}); }
		function reducePanel() { slidePanel({'big': 'small', 'small': 'hidden'}); }
		function slidePanel(nextStatePicker) {
			// met à jour les options (l'état de l'app)
			let panelNode = d3.event.target.parentNode;
			options.panels[panelNode.id] = nextStatePicker[panelNode.className];
			send('optionsChanged', options);
		}

		function render() {
			options = url.load();
			send('render', options);
		}
		on('render', updatePanels);

		function updatePanels(options) {
			let panelsMoved = false;
			for (let i in options.panels) {
				let node = d3.select('#' + i);
				let alreadyClassed = node.classed(options.panels[i]);
				if (!alreadyClassed) {
					node.node().className = options.panels[i];
					panelsMoved = true;
				}
			}
			if (panelsMoved) send('resize');
		}

		function initUI() {
			//TODO: gérer les layersGroups
			let legendArea = d3.select('#legend>section');
			let legend = legendArea.selectAll('label.layer').data(options.nodeLayers).enter()
				.append("label")
				.attr("class", "layer")
				.attr("id", function (l) {
					return 'nl' + l.id; //nl -> nodeLayer
				}).on('mouseover',partialHideNotConcerned)
				.on('mouseout',unhideAll);
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
					return !options.hideLayers['nl' + l.id];
				})
			;
			legend.append("span").text(function (l) {
				return t(l.label);
			});
		}
		function partialHideNotConcerned(e){
			d3.selectAll('.node, .link').classed('nearlyHidden',true);
			d3.selectAll('.node.nl'+e.id).classed('nearlyHidden',false);
		}
		function unhideAll(e){
			d3.selectAll('.node, .link').classed('nearlyHidden',false);
		}

		return {};
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();

