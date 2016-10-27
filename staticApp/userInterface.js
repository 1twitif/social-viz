window.addEventListener('hashchange',render);
window.addEventListener('configReady',render);
window.addEventListener('configReady',initUI);
d3.selectAll('.expand').on('click',expandPanel);
d3.selectAll('.reduce').on('click',reducePanel);

function expandPanel(){ slidePanel({'hidden':'small','small':'big'}); }
function reducePanel(){ slidePanel({'big':'small','small':'hidden'}); }
function slidePanel(nextStatePicker){
	// met à jour l'url selon les options
	var newStateOptions = {}, panelNode = d3.event.target.parentNode;
	newStateOptions[panelNode.id]=nextStatePicker[panelNode.className];
	url.save(newStateOptions);
	render();
}
function render(){
	var currentOptions = url.load();
	updatePanels(currentOptions);
}
function updatePanels(options){
	var panels = document.querySelectorAll('.hidden,.small,.big');
	for(var i in panels) if(options[panels[i].id]) panels[i].className = options[panels[i].id];
	multiTimeout(50,500,updateSvgArea);
}
function initUI(){
	//TODO: gérer les layersGroups
	var legendArea = d3.select('#legend>section');
	var legend = legendArea.selectAll('label.layer').data(options.nodeLayers).enter()
		.append("label")
		.attr("class", "layer")
		.attr("id", function (l) {return 'nl'+l.id;}); //nl -> nodeLayer
	legend.append("img")
		.attr("class", "picto")
		.attr("src", function (l) {return l.picto;})
	;
	legend.append("input")
		.attr("type", "checkbox")
		.attr("value", function (l) {return l.id;})
		.property("checked", function (l) {return !options.hideLayers['nl'+l.id];})
	;
	legend.append("span").text(function (l) {return t(l.label);});
}
