define([
		'../node_modules/d3/build/d3',
		'./smartEvents',
		'./fps',
		'./trad/trad',
		'./formLoader',
		'./graphDataLoader',
		'./structManipulation',
		'./json2dom'
	], (d3, ev, fps, trad, formLoader,graphDataLoader,struct,json2dom) => {
		'use strict';
		const on = ev.on, send = ev.send, t = trad.t, multiTimeout = fps.multiTimeout;
		let options,currentGraph;
	ev.need("config",(conf)=>{
		options=conf;
		ev.send("graph.config.ok");
	});
	ev.need("fullGraph",(fG)=>{
		currentGraph = struct.clone(fG);
		if(!currentGraph.node) currentGraph.node = {};
		if(!currentGraph.link) currentGraph.link = {};
		send("displayedGraph.filterTime",currentGraph);
		ev.send("graph.displayedGraph.ok");
	});

		ev.after(['graph.config.ok', 'graph.displayedGraph.ok', 'form.template.ready', 'trad loaded'],
			()=>setTimeout(()=>send('graph.init'),10));

		ev.after('graph.init', function () {

			on('fullGraph change',(data)=>{
				currentGraph = struct.merge(currentGraph, struct.clone(data));
				send("displayedGraph.filterTime",currentGraph);
			});
			on("displayedGraph.filterTime",(displayedGraph)=>{
				currentGraph = displayedGraph;
				updateGraph(currentGraph);
				agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
			},1);

			var zoom = d3.zoom()
				.scaleExtent([options.zoomMin, options.zoomMax])
				.on("zoom", zoomed);

			document.querySelector("#viz").innerHTML = ""; // on vire l'anim de chargement
			var svg = d3.select("#viz").call(zoom).on("dblclick.zoom", null),
				width = window.innerWidth,
				height = window.innerHeight;
			svg.classed("loading",false);

			var zoomableContainer = svg.append("g")
				.attr("class", "zoomableContainer");
			updateZoom();
			var centre = zoomableContainer.append("g")
				.attr("class", "centre")
				.attr("transform", 'translate(' + width / 2 + ',' + height / 2 + ')');

			centre.append("image")
				.attr("xlink:href", options.centerLogoUrl)
				.attr("x", -options.centerLogoWidth / 2)
				.attr("y", -options.centerLogoHeight / 2)
				.attr("width", options.centerLogoWidth)
				.attr("height", options.centerLogoHeight)
				.attr("opacity", options.centerLogoOpacity)
			;
			function updateSvgArea() {
				var legendWidth = document.querySelector('#legend').offsetLeft + document.querySelector("#legend").offsetWidth,
					detailsWidth = window.innerWidth - document.querySelector("#details").offsetLeft,
					toolsHeight = document.querySelector('#tools-panel').offsetTop + document.querySelector("#tools-panel").offsetHeight;
				width = window.innerWidth - legendWidth - detailsWidth;
				height = window.innerHeight - toolsHeight;
				svg.attr("width", width).attr("height", height).attr("style", 'left:' + legendWidth + 'px;top:' + toolsHeight + 'px');
				centre.attr("transform", 'translate(' + width / 2 + ',' + height / 2 + ')');
				updateZoom();
				applyFixedNode();
				updateSelection();
				updateCenterForce();
				agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
			}

			on('resize', () => multiTimeout(50, 500, updateSvgArea));
			on('dataInitDone', () => multiTimeout(50, 500, updateSvgArea));

			var color = d3.scaleOrdinal(d3.schemeCategory20);

			var simulation = d3.forceSimulation()
					.alphaDecay(options.friction)
					.force("noCollision", d3.forceManyBody().distanceMax(2 * options.nodeBaseRadius * options.nodeMinRatio).strength(options.noCollisionForce))
					.force("proximityWarning", d3.forceManyBody().distanceMax(options.proximityWarningDistanceRatio * 2 * options.nodeBaseRadius * options.nodeMaxRatio).strength(options.proximityWarningForce))
					.force("gazDispersion", d3.forceManyBody().distanceMax(options.gazDispersionMaxDistanceRatio * 2 * options.nodeBaseRadius * options.nodeMaxRatio).strength(options.gazDispersionForce))
				;
			updateCenterForce();

			let allLinksG = zoomableContainer.append("g")
				.attr("class", "links");
			let allNodesG = zoomableContainer.append("g")
				.attr("class", "nodes");

			let link = allLinksG
				.selectAll("line")
			let node = allNodesG
				.selectAll("g.node")

			function updateGraph(currentGraph){
				simulation
					.nodes(currentGraph.node)
					.force("link",
						d3.forceLink()
							.id(function (d) {
								return d.id;
							})
							.links(currentGraph.link)
					)
				;
				computeNodesDegree(currentGraph);

				let nodeRadiusScale = d3.scaleLinear()
					.domain(d3.extent(currentGraph.node, function (n) {
						return n.degree;
					}))
					.range([options.nodeMinRatio, options.nodeMaxRatio]);

				link = link.data(currentGraph.link);
				node = node.data(currentGraph.node);

/*
				let link = allLinksG
					.selectAll("line")
					.data(currentGraph.link);
*/

				let linkEnter = link.enter().append("line")
					.attr("id", (n) => n.id)
					.attr("class", "link")
					.attr("stroke-width", function (d) {
						return 2*Math.sqrt(d.value || 1);
					})
					.on("click", selectLink);

				link.exit().remove();
				link = linkEnter.merge(link);//.attr("class","merged");

/*				let node = allNodesG
					.selectAll("g.node")
					.data(currentGraph.node);*/
				let nodeEnter = node.enter()
						.append("g")
						.attr("class", "node")
						.attr("id", function (n) {
							return n.id;
						})
						.on("dblclick", dblclick)
						.call(d3.drag()
							.on("start", dragstarted)
							.on("drag", dragged)
							.on("end", dragended))
					;

				nodeEnter.append("circle")
					.attr("cx", 0).attr("cy", 0)
					.attr("r", function (n) {
						n.r = options.nodeBaseRadius * nodeRadiusScale(n.degree);
						return n.r * options.nodeStyle.selectionSize
					})
					//.attr("opacity", .2) //FIXME: nombre magique
					.attr("fill", function (d) {
						return color(0);//FIXME: couleur magique
					});
				nodeEnter.append("path")
					.attr("d", function (n) {
						return points2Path(regularPolygon(0, 0, n.r * options.nodeStyle.selectionSize, options.fixedNode.sides), options.fixedNode.tension)+' z';
					})
					.attr("transform","rotate(22.5)")
					.attr("fill", function (d) {
						return color(0);//FIXME: couleur magique
					});

				// image par calques.
				const domLayerList = json2dom.json2dom(options.layers);
				const flatFinalLayers = json2dom.xpath("//*[criterion]",domLayerList);
				for(let domLayer of flatFinalLayers){
					const layer = json2dom.dom2json(domLayer);
					if(options.hideLayers[layer.name]) continue;

					let domGraph = json2dom.json2dom(currentGraph);
					const selected = json2dom.xpath(layer.criterion,domGraph,XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
					const selectedSet = {};
					for(let domNode of selected){
						let id = domNode.querySelector('id').innerText;
						let type = id.split('-')[0];
						//if(type === "link") continue;
						selectedSet[id] = true;
					}
					nodeEnter
						.filter((n)=>selectedSet[n.id])
						.classed(layer.name, true);
					linkEnter
						.filter((n)=>selectedSet[n.id])
						.classed(layer.name, true);

					if(layer.name.split('_')[0] !== "Fonction") continue; //FIXME: virrer cette restriction

					nodeEnter
						.filter((n)=>selectedSet[n.id])
						.append("image")
						.attr("xlink:href", options.layersPictoFolder+layer.name+".svg")
						.attr("x", function (n) {
							return -n.r / 2;
						})
						.attr("y", function (n) {
							return -n.r / 2;
						})
						.attr("width", function (n) {
							return n.r;
						})
						.attr("height", function (n) {
							return n.r;
						}).on("error",build_imageLoadErrorPlaceOverFunc(layer.name));
				}

				nodeEnter.append("text")
					.attr("text-anchor", "middle")
					.attr("dx", 0)
					.attr("dy", function (n) {
						return n.r;
					})
					.text(function (n) {
						return t(n.label)
					});
				nodeEnter.append("title")
					.text(function (n) {
						return t(n.label);
					});
				node.exit().remove();
				node = nodeEnter.merge(node);



				var linkLengthScale = d3.scaleLinear()
					.domain(d3.extent(currentGraph.node, function (n) {
						return n.degree;
					}))
					.range([options.linkLengthMinRatio, options.linkLengthMaxRatio]);

				simulation.force("link")
					.strength(function strength(link) {
						return options.linkStrengthRatio / Math.min(link.source.degree, link.target.degree);
					})
					.distance(function (link) {
						var distanceMin = (link.source.r + link.target.r);
						return distanceMin + distanceMin * linkLengthScale(Math.min(link.source.degree, link.target.degree));
					})
				;
				//simulation.restart()
			}
			updateGraph(currentGraph);
			function ticked() {
				allNodesG.selectAll("g.node")
					.attr("transform", function (n) {
						if (options.confiner) {
							var zx = centerRatioX2D3X(options.zoom.x),
								zy = centerRatioY2D3Y(options.zoom.y);
							var limiteGauche = n.r - zx / options.zoom.k;
							var limiteHaut = n.r - zy / options.zoom.k;
							var limiteDroite = (width - zx) / options.zoom.k - n.r;
							var limiteBas = (height - zy) / options.zoom.k - n.r;
							n.x = Math.max(limiteGauche, Math.min(limiteDroite, n.x));
							n.y = Math.max(limiteHaut, Math.min(limiteBas, n.y));
						}
						if(isNaN(n.x)) n.x = 0;
						if(isNaN(n.y)) n.y = 0;
						if(isNaN(n.r)) n.r = 0;
						if(isNaN(n.vx)) n.vx = 0;
						if(isNaN(n.vy)) n.vy = 0;
						return "translate(" + n.x + "," + n.y + ")";
					});
				allLinksG.selectAll("line")
					.attr("x1", function (d) {
						return d.source.x;
					})
					.attr("y1", function (d) {
						return d.source.y;
					})
					.attr("x2", function (d) {
						return d.target.x;
					})
					.attr("y2", function (d) {
						return d.target.y;
					})
				;
				fps.tick();
			}
			simulation.on("tick", ticked);



				send('dataInitDone');


			function zoomed() {
				options.zoom = {
					"x": round(d3X2CenterRatioX(d3.event.transform.x, d3.event.transform.k), options.zoomPrecisionXY),
					"y": round(d3Y2CenterRatioY(d3.event.transform.y, d3.event.transform.k), options.zoomPrecisionXY),
					"k": round(d3.event.transform.k, options.zoomPrecisionK)
				};
				updateZoom();
				if (options.confiner) agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
			}

			function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(options.boostAgitation.force).restart();
				d.dragOriginX = d.x;
				d.dragOriginY = d.y;
				d.wasSelected = false;
				var id = getNearestAncestorId(d3.event.sourceEvent.target);
				if (options.selected !== id) options.selected = id;
				else d.wasSelected = true;
				//updateSelection();
				updateCenterForce();
			}

			function dragged(d) {

				if (Math.abs(d3.event.x - d.dragOriginX) > 5 || Math.abs(d3.event.y - d.dragOriginY) > 5) { //FIXME: magic number
					if (d.fx == null) {
						d3.select(this).classed("fixed", d.fixed = true);
					}
					d.fx = d3.event.x;
					d.fy = d3.event.y;
				}
			}

			function dragended(d) {
				if (Math.abs(d3.event.x - d.dragOriginX) > 5 || Math.abs(d3.event.y - d.dragOriginY) > 5) { //FIXME: magic number
					var d3ToCentricX = d3.scaleLinear().domain([0, width]).range([-1, 1]);
					var d3ToCentricY = d3.scaleLinear().domain([0, height]).range([-1, 1]);
					if (!options.fixedNodes) options.fixedNodes = {};
					var id = getNearestAncestorId(d3.event.sourceEvent.target);
					options.fixedNodes[id] = {
						"x": round(d3ToCentricX(d.x), 2),
						"y": round(d3ToCentricY(d.y), 2)
					};
				} else if (d.wasSelected) {
					options.selected = undefined;
				}
				//updateSelection();
				agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
			}

			function dblclick(d) {
				d3.select(this).classed("fixed", d.fixed = false);
				d.fx = null;
				d.fy = null;
				var id = getNearestAncestorId(d3.event.sourceEvent.target);
				options.fixedNodes[id] = undefined;
				updateZoom();
				updateCenterForce();
				agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
			}
			function selectLink(l){
				if(options.selected !== l.id) options.selected = l.id;
				else options.selected = "";
			}


			function applyFixedNode() {
				var centricToD3X = d3.scaleLinear().domain([-1, 1]).range([0, width]);
				var centricToD3Y = d3.scaleLinear().domain([-1, 1]).range([0, height]);
				for (var id in options.fixedNodes) {
					var fixed = options.fixedNodes[id];
					var n = d3.select('#' + id).node().__data__;
					d3.select('#' + id).classed("fixed", n.fixed = true);
					n.fx = centricToD3X(fixed.x);
					n.fy = centricToD3Y(fixed.y);
				}
				updateCenterForce();
			}

			function agitationTemporaire(duration, amplitude) {
				simulation.alphaTarget(amplitude).restart();
				setTimeout(function () {
					simulation.alphaTarget(0);
				}, Math.round(duration * 1000));
			}

			on("config.selected change",updateSelection);
			function updateSelection() {
				d3.selectAll('.selected').classed("selected", function (n) {
					return n.selected = false;
				});
				if (options.selected) {
					d3.select('#' + options.selected).classed("selected", function (n) {
						return n.selected = true;
					});
				}
				//allLinksG.selectAll("line").attr("stroke", (l)=>l.id===options.selected?'red':'grey');
				//updateDetails();
			}

			on('lang.update', updateDetails);
			function updateDetails() {
				return;
				var details = document.querySelector("#details section");
				var tutorialContent = "<h2>Tutorial</h2>\nMettre en pause / reprendre"; //FIXME: charger ça dynamiquement.
				if (!options.selected && !options.userMode) details.innerHTML = tutorialContent;
				else if (!options.userMode) details.innerHTML = renderDetails(options.selected);
				else details.innerHTML = options.userMode + t(' pas encore géré');
				//FIXME: ugly code smell
			}

			function renderDetails(id) {
				const detailsFunctions = {"node": renderNodeDetails};
				return detailsFunctions[id.split('-')[0]](id);
			}

			function renderNodeDetails(id) {
				var n = d3.select('#' + id).node().__data__;
				var res = "<h1>" + n.id + "</h1>\n<div>Voisins ( " + n.degree + " ) :</div>\n<ul>";
				for (var i = 0; i < currentGraph.link.length; ++i) {
					if (currentGraph.link[i].source.id === id) res += "<li>" + currentGraph.link[i].value + " " + currentGraph.link[i].target.id + " ( " + currentGraph.link[i].target.degree + " ) </li>";
					if (currentGraph.link[i].target.id === id) res += "<li>" + currentGraph.link[i].value + " " + currentGraph.link[i].source.id + " ( " + currentGraph.link[i].source.degree + " ) </li>";
				}
				return res + "</ul>";
			}

			function updateCenterForce() {
				if (document.querySelectorAll(".fixed").length) simulation.force("center", undefined);
				else simulation.force("center", d3.forceCenter(width / 2, height / 2));
			}

			function computeNodesDegree(graph) {
				for (var i = 0; i < graph.node.length; ++i) graph.node[i].degree = 0;
				for (var i = 0; i < graph.link.length; ++i) {
					++graph.link[i].source.degree;
					++graph.link[i].target.degree;
				}
			}

			function updateZoom() {
				var zoom = options.zoom;
				if(!zoom) return;
				zoomableContainer.attr("transform",
					"translate(" + centerRatioX2D3X(zoom.x) + "," + centerRatioY2D3Y(zoom.y) + ") scale(" + zoom.k + ")");
			}

			function d3X2CenterRatioX(d3x, k) {
				if (!k) k = options.zoom.k;
				return d3x / (width / 2) + k - 1;
			}//(2*d3x/width-1)*k; }
			function d3Y2CenterRatioY(d3y, k) {
				if (!k) k = options.zoom.k;
				return d3y / (height / 2) + k - 1;
			}

			function centerRatioX2D3X(x) {
				return (1 + x - options.zoom.k) * width / 2;
			}

			function centerRatioY2D3Y(y) {
				return (1 + y - options.zoom.k) * height / 2;
			}

			function round(number, decimals) {
				if (!decimals) decimals = 0;
				return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
			}

			// fixedNodeFactory
			function regularPolygon(x, y, radius, sides) {
				var crd = [];
				if (sides == 1) return [[x, y]];
				for (var i = 0; i < sides; i++) {
					crd.push({
						"x": (x + (Math.sin(2 * Math.PI * i / sides) * radius)),
						"y": (y - (Math.cos(2 * Math.PI * i / sides) * radius))
					});
				}
				return crd;
			}

			function points2Path(points, tension) {
				var drawer = d3.line()
					.x(function (d) {
						return d.x;
					})
					.y(function (d) {
						return d.y;
					})
					//.curve(d3.curveCardinalClosed.tension(tension));
				return drawer(points);
			}
		});
	function build_imageLoadErrorPlaceOverFunc(id) { //FIXME: doublon legendView. La ranger mieux (et la coder)
		return (e) => {
			//FIXME: if svg fail -> png, if png fail -> identicon
			//https://github.com/davidbau/seedrandom

			//https://www.khanacademy.org/computer-programming/random-face-generator/6612995667394560
			//http://svgavatars.com/
			//http://bl.ocks.org/enjalot/1282943
			//https://github.com/alexvandesande/blockies
			//https://github.com/dmester/jdenticon
			// default image
			d3.event.target["xlink:href"] = options.defaultPicto;
		}
	}
	function getNearestAncestorId(node){
		const ancestors = json2dom.xpath('ancestor::*[@id]',node,XPathResult.ORDERED_NODE_ITERATOR_TYPE);
		const layerNode = ancestors[ancestors.length-1];
		return layerNode.id;
	}
		return {};
	});
