define(['//d3js.org/d3.v4.min.js', //'node_modules/d3/build/d3.min.js'
		'languageLoader'
//		'jsonUrlHashPersistance',
	],
	function (d3, langTools) {
		const t = langTools.t;
		on('hashchange', render);
		on('configReady', render);
		on('configReady', initUI);
		d3.selectAll('.expand').on('click', expandPanel);
		d3.selectAll('.reduce').on('click', reducePanel);

		function expandPanel() {
			slidePanel({'hidden': 'small', 'small': 'big'});
		}

		function reducePanel() {
			slidePanel({'big': 'small', 'small': 'hidden'});
		}

		function slidePanel(nextStatePicker) {
			// met à jour les options (l'état de l'app)
			var panelNode = d3.event.target.parentNode;
			options.panels[panelNode.id] = nextStatePicker[panelNode.className];
			send('optionsChanged', options);
		}

		function render() {
			options = url.load();
			send('render', options);
		}

		on('render', updatePanels);
		function updatePanels(options) {
			var panelsMoved = false;
			for (var i in options.panels) {
				var node = d3.select('#' + i);
				var alreadyClassed = node.classed(options.panels[i]);
				if (!alreadyClassed) {
					node.node().className = options.panels[i];
					panelsMoved = true;
				}
			}
			if (panelsMoved) multiTimeout(50, 500, updateSvgArea);
		}

		function initUI() {
			//TODO: gérer les layersGroups
			var legendArea = d3.select('#legend>section');
			var legend = legendArea.selectAll('label.layer').data(options.nodeLayers).enter()
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
	});
