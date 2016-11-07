var updateSvgArea;
on('configReady', function () {
	var graph;
	var zoom = d3.zoom()
		.scaleExtent([options.zoomMin, options.zoomMax])
		.on("zoom", zoomed);

	var svg = d3.select("#viz").call(zoom).on("dblclick.zoom", null),
		width = window.innerWidth,
		height = window.innerHeight;
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
	updateSvgArea = function updateSvgArea() {
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
	};

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var simulation = d3.forceSimulation()
			.alphaDecay(options.friction)
			.force("noCollision", d3.forceManyBody().distanceMax(2 * options.nodeBaseRadius * options.nodeMinRatio).strength(options.noCollisionForce))
			.force("proximityWarning", d3.forceManyBody().distanceMax(options.proximityWarningDistanceRatio * 2 * options.nodeBaseRadius * options.nodeMaxRatio).strength(options.proximityWarningForce))
			.force("gazDispersion", d3.forceManyBody().distanceMax(options.gazDispersionMaxDistanceRatio * 2 * options.nodeBaseRadius * options.nodeMaxRatio).strength(options.gazDispersionForce))
		;
	updateCenterForce();

	d3.json("allData/publicData.json", function (error, graphData) {
		if (error) throw error;
		graph = graphData;
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
				.attr("id", function (n) { return "n"+n.id; })
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
			.attr("xlink:href", function (n) { return options.nodeLayers[n.type]?options.nodeLayers[n.type].picto:options.defaultPicto;})
			.attr("x", function (n) { return -n.r / 2; })
			.attr("y", function (n) { return -n.r / 2; })
			.attr("width", function (n) { return n.r; })
			.attr("height", function (n) { return n.r; })
		;
		node.append("text")
			.attr("text-anchor", "middle")
			.attr("dx", 0)
			.attr("dy", function (n) { return n.r; })
			.text(function (n) { return t(n.id) });
		node.append("title")
			.text(function (d) { return t(d.id); });



		function ticked() {
			node
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
		options.zoom = {
			"x":round(d3X2CenterRatioX(d3.event.transform.x,d3.event.transform.k),options.zoomPrecisionXY),
				"y":round(d3Y2CenterRatioY(d3.event.transform.y,d3.event.transform.k),options.zoomPrecisionXY),
				"k":round(d3.event.transform.k,options.zoomPrecisionK)
		};
		url.save(options);
		updateZoom();
		if(options.confiner) agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(options.boostAgitation.force).restart();
		d.dragOriginX = d.x;
		d.dragOriginY = d.y;
		d.wasSelected = false;
		if(options.selected!=="n"+d.id) options.selected="n"+d.id;
		else d.wasSelected = true;
		updateSelection();
		updateCenterForce();
	}
	function dragged(d) {

		if(Math.abs(d3.event.x-d.dragOriginX)>5 || Math.abs(d3.event.y-d.dragOriginY)>5){ //FIXME: magic number
			if(d.fx == null) {
				d3.select(this).classed("fixed", d.fixed = true);
			}
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}
	}

	function dragended(d) {
		if(Math.abs(d3.event.x-d.dragOriginX)>5 || Math.abs(d3.event.y-d.dragOriginY)>5) { //FIXME: magic number
			var d3ToCentricX = d3.scaleLinear().domain([0, width]).range([-1, 1]);
			var d3ToCentricY = d3.scaleLinear().domain([0, height]).range([-1, 1]);
			if (!options.fixedNodes) options.fixedNodes = {};
			options.fixedNodes["n" + d.id] = {
				"x": round(d3ToCentricX(d.x), 2),
				"y": round(d3ToCentricY(d.y), 2)
			};
		} else if (d.wasSelected){
			options.selected=undefined;
		}
		url.save(options);
		updateSelection();
		agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
	}
	function dblclick(d){
		d3.select(this).classed("fixed", d.fixed = false);
		d.fx = null;
		d.fy = null;
		options.fixedNodes["n"+d.id] = undefined;
		url.save(options);
		updateZoom();
		updateCenterForce();
		agitationTemporaire(options.boostAgitation.temps, options.boostAgitation.force);
	}
	function applyFixedNode(){
		var centricToD3X = d3.scaleLinear().domain([-1,1]).range([0,width]);
		var centricToD3Y = d3.scaleLinear().domain([-1,1]).range([0,height]);
		for (var id in options.fixedNodes){
			var fixed = options.fixedNodes[id];
			var n = d3.select('#'+id).node().__data__;
			d3.select('#'+id).classed("fixed", n.fixed = true);
			n.fx = centricToD3X(fixed.x);
			n.fy = centricToD3Y(fixed.y);
		}
		updateCenterForce();
	}
	function agitationTemporaire(duration, amplitude) {
		simulation.alphaTarget(amplitude).restart();
		setTimeout(function () {
			simulation.alphaTarget(0);
		}, Math.round(duration*1000));
	}
	function updateSelection() {
		d3.selectAll('.node.selected').classed("selected", function(n){return n.selected = false;});
		if(options.selected){
			d3.select('#'+options.selected).classed("selected",function(n){return n.selected = true;});
		}
		updateDetails();
	}
	function updateDetails(){
		var details = document.querySelector("#details section");
		var tutorialContent = "<h2>Tutorial</h2>\nMettre en pause / reprendre"; //FIXME: charger ça dynamiquement.
		if(!options.selected && !options.userMode) details.innerHTML = tutorialContent;
		else if(!options.userMode) details.innerHTML = renderDetails(options.selected);
		else if(options.userMode=='trad') renderTradForm();
		else details.innerHTML = options.userMode + t(' pas encore géré');
		//FIXME: ugly code smell
	}
	function renderDetails(id){
		var detailsFunctions = {"n":renderNodeDetails};
		return detailsFunctions[id.substring(0,1)](id.substring(1));
	}
	function renderNodeDetails(id){
		var n = d3.select('#n'+id).node().__data__;
		var res = "<h1>"+n.id+"</h1>\n<div>Voisins ( "+n.degree+" ) :</div>\n<ul>";
		for (var i = 0; i < graph.links.length; ++i) {
			if(graph.links[i].source.id === id) res += "<li>"+graph.links[i].value+" "+graph.links[i].target.id+" ( "+graph.links[i].target.degree+" ) </li>";
			if(graph.links[i].target.id === id) res += "<li>"+graph.links[i].value+" "+graph.links[i].source.id+" ( "+graph.links[i].source.degree+" ) </li>";
		}
		return res+"</ul>";
	}
	function updateCenterForce(){
		if(document.querySelectorAll(".fixed").length) simulation.force("center", undefined);
		else simulation.force("center", d3.forceCenter(width / 2, height / 2));
	}
	function computeNodesDegree(graph) {
		for (var i = 0; i < graph.nodes.length; ++i) graph.nodes[i].degree = 0;
		for (var i = 0; i < graph.links.length; ++i) {
			++graph.links[i].source.degree;
			++graph.links[i].target.degree;
		}
	}
	function updateZoom(){
		options = url.load();
		var zoom = options.zoom;

		zoomableContainer.attr("transform",
			"translate(" + centerRatioX2D3X(zoom.x) + "," + centerRatioY2D3Y(zoom.y) + ") scale(" + zoom.k + ")");
	}
	function d3X2CenterRatioX(d3x,k){ if(!k) k = options.zoom.k; return d3x/(width/2)+k-1; }//(2*d3x/width-1)*k; }
	function d3Y2CenterRatioY(d3y,k){ if(!k) k = options.zoom.k; return d3y/(height/2)+k-1; }
	function centerRatioX2D3X(x){ return (1+x-options.zoom.k)*width/2; }
	function centerRatioY2D3Y(y){ return (1+y-options.zoom.k)*height/2; }
	function round(number,decimals) { if(!decimals)decimals=0;
		return Math.round(number*Math.pow(10,decimals))/Math.pow(10,decimals); }
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
