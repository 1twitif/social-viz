var updateSvgArea;
window.addEventListener('configReady', function () {
	var zoom = d3.zoom()
		.scaleExtent([options.zoomMin, options.zoomMax])
		.on("zoom", zoomed);

	var svg = d3.select("#viz").call(zoom).on("dblclick.zoom", null),
		width = window.innerWidth,
		height = window.innerHeight;
	var zoomableContainer = svg.append("g")
			.attr("class", "zoomableContainer")
			.attr("transform", "translate(" + options.zoom.x + "," + options.zoom.y + ") scale(" + options.zoom.k + ")");
		;
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
	updateSvgArea = function updateSvgArea() {
		var legendWidth = document.querySelector('#legend').offsetLeft + document.querySelector("#legend").offsetWidth,
			detailsWidth = window.innerWidth - document.querySelector("#details").offsetLeft,
			toolsHeight = document.querySelector('#tools-panel').offsetTop + document.querySelector("#tools-panel").offsetHeight;
		width = window.innerWidth - legendWidth - detailsWidth;
		height = window.innerHeight - toolsHeight;
		svg.attr("width", width).attr("height", height).attr("style", 'left:' + legendWidth + 'px;top:' + toolsHeight + 'px');
		centre.attr("transform", 'translate(' + width / 2 + ',' + height / 2 + ')');
		simulation.force("center", d3.forceCenter(width / 2, height / 2));
		agitationTemporaire(3000, 0.5); // FIXME: nombres magique
	};
	function agitationTemporaire(duration, amplitude) {
		simulation.alphaTarget(amplitude).restart();
		setTimeout(function () {
			simulation.alphaTarget(0);
		}, duration)

	}

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var simulation = d3.forceSimulation()
			.alphaDecay(options.friction)
			.force("noCollision", d3.forceManyBody().distanceMax(2 * options.nodeBaseRadius * options.nodeMinRatio).strength(options.noCollisionForce))
			.force("proximityWarning", d3.forceManyBody().distanceMax(options.proximityWarningDistanceRatio * 2 * options.nodeBaseRadius * options.nodeMaxRatio).strength(options.proximityWarningForce))
			.force("gazDispersion", d3.forceManyBody().distanceMax(options.gazDispersionMaxDistanceRatio * 2 * options.nodeBaseRadius * options.nodeMaxRatio).strength(options.gazDispersionForce))
			.force("center", d3.forceCenter(width / 2, height / 2))
		;

	d3.json("allData/publicData.json", function (error, graphData) {
		if (error) throw error;
		simulation
			.nodes(graphData.nodes)
			.force("link",
				d3.forceLink()
					.id(function (d) { return d.id; })
					.links(graphData.links)
			)
		;
		computeNodesDegree(graphData);
		var nodeRadiusScale = d3.scaleLinear()
			.domain(d3.extent(graphData.nodes, function (n) {
				return n.degree;
			}))
			.range([options.nodeMinRatio, options.nodeMaxRatio]);

		var link = zoomableContainer.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(graphData.links)
			.enter().append("line")
			.attr("stroke-width", function (d) {
				return Math.sqrt(d.value);
			})
			.attr("stroke", 'grey');



		var node = zoomableContainer.append("g")
				.attr("class", "nodes")
				.selectAll("g.node")
				.data(graphData.nodes)
				.enter()
				.append("g")
				.attr("class", "node")
				.on("dblclick", dblclick)
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended))
			;

		node.append("circle")
			.attr("cx", 0).attr("cy", 0)
			.attr("r", function (n) {
				return n.r = options.nodeBaseRadius * nodeRadiusScale(n.degree);
			})
			.attr("opacity", .2) //FIXME: nombre magique
			.attr("fill", function (d) {
				return color(d.type);
			});
		node.append("path")
			.attr("d", function (n) {
				return points2Path(regularPolygon(0, 0, n.r, options.fixedNode.sides),options.fixedNode.tension);
			})
			.attr("fill", function (d) {
				return color(d.type);
			});		node.append("image")
			.attr("xlink:href", function (n) { return options.nodeLayers[n.type].picto; })
			.attr("x", function (n) { return -n.r / 2; })
			.attr("y", function (n) { return -n.r / 2; })
			.attr("width", function (n) { return n.r; })
			.attr("height", function (n) { return n.r; })
		;
		node.append("text")
			.attr("text-anchor", "middle")
			.attr("dx", 0)
			.attr("dy", function (n) { return n.r; })
			.text(function (n) { return n.id });
		node.append("title")
			.text(function (d) { return d.id; });



		function ticked() {
			node
				.attr("transform", function (n) {
					if (options.confiner) {
						var limiteGauche = n.r - options.zoom.x / options.zoom.k;
						var limiteHaut = n.r - options.zoom.y / options.zoom.k;
						var limiteDroite = (width - options.zoom.x) / options.zoom.k - n.r;
						var limiteBas = (height - options.zoom.y) / options.zoom.k - n.r;
						n.x = Math.max(limiteGauche, Math.min(limiteDroite, n.x));
						n.y = Math.max(limiteHaut, Math.min(limiteBas, n.y));
					}
					return "translate(" + n.x + "," + n.y + ")";
				});
			link
				.attr("x1", function (d) { return d.source.x; })
				.attr("y1", function (d) { return d.source.y; })
				.attr("x2", function (d) { return d.target.x; })
				.attr("y2", function (d) { return d.target.y; })
			;
			fpsTick();
		}

		var linkLengthScale = d3.scaleLinear()
			.domain(d3.extent(graphData.nodes, function (n) { return n.degree; }))
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
		simulation.on("tick", ticked);
		updateSvgArea();
	});
	function zoomed() {
		url.save({'zoom':{
			"x":Math.round(d3.event.transform.x*1000)/1000,
			"y":Math.round(d3.event.transform.y*1000)/1000,
			"k":Math.round(d3.event.transform.k*1000)/1000
		}});
		options = url.load();
		var zoom = options.zoom;
		zoomableContainer.attr("transform", "translate(" + zoom.x + "," + zoom.y + ") scale(" + zoom.k + ")");
		agitationTemporaire(2000, 0.3); //FIXME: nombre magique
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart(); //FIXME: nombre magique
		d3.select(this).classed("fixed", d.fixed = true);
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0); //FIXME: nombre magique
	}
	function dblclick(d){
		d3.select(this).classed("fixed", d.fixed = false);
		d.fx = null;
		d.fy = null;
	}

	function computeNodesDegree(graph) {
		for (var i = 0; i < graph.nodes.length; ++i) graph.nodes[i].degree = 0;
		for (var i = 0; i < graph.links.length; ++i) {
			++graph.links[i].source.degree;
			++graph.links[i].target.degree;
		}
	}

	// fixedNodeFactory
	function regularPolygon(x, y, radius, sides) {
		var crd = [];
		if (sides == 1) return [[x, y]];
		for (var i = 0; i < sides; i++) {
			crd.push({"x":(x + (Math.sin(2 * Math.PI * i / sides) * radius)), "y":(y - (Math.cos(2 * Math.PI * i / sides) * radius))});
		}
		return crd;
	}
	function points2Path (points,tension){
		var drawer = d3.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.curve(d3.curveCardinalClosed.tension(tension));
		return drawer(points);
	}


});
