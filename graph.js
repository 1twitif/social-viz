var options = {};
options.nodeBaseRadius = 32;
options.nodeMinRatio = 0.75;
options.nodeMaxRatio = 2;
options.linkStrengthRatio = 0.8;
options.linkLengthMinRatio = 0;
options.linkLengthMaxRatio = 2;
options.confiner = true;

var zoom = d3.zoom()
	.scaleExtent([0.1, 10])
	.on("zoom", zoomed);

var svg = d3.select("#viz").call(zoom),
	width = window.innerWidth,
	height = window.innerHeight;
var zoomableContainer = svg.append("g")
	.attr("class", "zoomableContainer")
	;
var rect = zoomableContainer.append('rect')
	.style('fill','yellow');
function updateSvgArea(){
	var legendWidth = document.querySelector('#legend').offsetLeft + document.querySelector("#legend").offsetWidth,
		detailsWidth = window.innerWidth - document.querySelector("#details").offsetLeft,
		toolsHeight = document.querySelector('#tools-panel').offsetTop + document.querySelector("#tools-panel").offsetHeight;
	width = window.innerWidth - legendWidth - detailsWidth;
	height = window.innerHeight - toolsHeight;
	svg.attr("width",width).attr("height",height).attr("style",'left:'+legendWidth+'px;top:'+toolsHeight+'px');

	rect.attr("x",5).attr("y",5).attr("width",width-10).attr("height",height-10);

	simulation.force("center", d3.forceCenter(width / 2, height / 2));
	simulation.alphaTarget(0.5).restart();
	setTimeout(function () {
		simulation.alphaTarget(0);
	},3000)
}
var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
	//.alphaDecay(0.002)
	.force("no-collision", d3.forceManyBody().distanceMax(2*options.nodeBaseRadius*options.nodeMinRatio).strength(-1000))
	.force("proximity-warning", d3.forceManyBody().distanceMax(2*options.nodeBaseRadius*options.nodeMaxRatio).strength(-400))
	.force("gaz-dispersion", d3.forceManyBody().distanceMax(5*2*options.nodeBaseRadius*options.nodeMaxRatio).strength(-100))
	//.force("center", d3.forceCenter(width / 2, height / 2))
		//.force("x", d3.forceX(width / 2).strength(.01))
		//.force("y", d3.forceY(height / 2).strength(.01))
	;

d3.json("publicData.json", function(error, graph) {
	if (error) throw error;
	simulation
		.nodes(graph.nodes)
		.force("link", d3.forceLink()
			.id(function(d) { return d.id; })
			.links(graph.links)
		)
		;
	computeNodesDegree(graph);
	var nodeRadiusScale = d3.scaleLinear()
		.domain(d3.extent(graph.nodes,function(n){return n.degree;}))
		.range([options.nodeMinRatio,options.nodeMaxRatio]);

	var link = zoomableContainer.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.attr("stroke-width", function(d) { return Math.sqrt(d.value); })
		.attr("stroke", 'grey');

	var node = zoomableContainer.append("g")
		.attr("class", "nodes")
		.selectAll("g.node")
		.data(graph.nodes)
		.enter()
		.append("g")
			.attr("class", "node")
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended))
		;
	node.append("circle")
		.attr("cx", 0).attr("cy", 0)
			.attr("r", function(n){
				return n.r = options.nodeBaseRadius*nodeRadiusScale(n.degree);
			})
			.attr("opacity", .5)
			.attr("fill", function(d) { return color(d.group); });
	node.append("image")
		.attr("xlink:href", "img/github.svg")
		.attr("x", function(n){return -n.r/2;})
		.attr("y", function(n){return -n.r/2;})
		.attr("width", function(n){return n.r;})
		.attr("height", function(n){return n.r;});
	node.append("text")
		.attr("text-anchor", "middle")
		.attr("dx", 0)
		.attr("dy", function (n) {
			return n.r;
		})
			.text(function(n) { return n.id });
	node.append("title")
		.text(function(d) { return d.id; });

	function ticked() {
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node
			.attr("transform", function(n) {
				if(options.confiner){
					n.x = Math.max(n.r, Math.min(width-n.r, n.x));
					n.y = Math.max(n.r, Math.min(height-n.r, n.y));
				}
				return "translate("+n.x+","+n.y+")";
			});
		fpsTick();
	}
	var linkLengthScale = d3.scaleLinear()
		.domain(d3.extent(graph.nodes,function(n){return n.degree;}))
		.range([options.linkLengthMinRatio,options.linkLengthMaxRatio]);

	simulation.force("link")
		.strength(function strength(link) {
			return options.linkStrengthRatio / Math.min(link.source.degree, link.target.degree);
		})
		.distance(function(link) {
			var distanceMin = (link.source.r + link.target.r);
			return distanceMin + distanceMin * linkLengthScale(Math.min(link.source.degree, link.target.degree));
		})
	;
	simulation.on("tick", ticked);
	updateSvgArea();
});
function zoomed() {
	console.log(d3.event);
	zoomableContainer.attr("transform", d3.event.transform);
	rect.attr("width",(width-10)/(d3.event.transform.k)).attr("height",(height-10)/(d3.event.transform.k))
	rect.attr("x",5-(d3.event.transform.x/d3.event.transform.k)).attr("y",5-(d3.event.transform.y/d3.event.transform.k))
}
function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}
function computeNodesDegree(graph){
	for (var i = 0; i < graph.nodes.length; ++i) graph.nodes[i].degree=0;
	for (var i = 0; i < graph.links.length; ++i){
		++graph.links[i].source.degree;
		++graph.links[i].target.degree;
	}
}
