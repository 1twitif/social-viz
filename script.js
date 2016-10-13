document.addEventListener('hashchange',render);
d3.selectAll('.expand').on('click',expandPanel);
d3.selectAll('.reduce').on('click',reducePanel);

function expandPanel(){ slidePanel({'hidden':'small','small':'big'}); }
function reducePanel(){ slidePanel({'big':'small','small':'hidden'}); }
function slidePanel(nextStatePicker){
	// met à jour l'url selon les options
	var options = {}, panelNode = d3.event.target.parentNode;
	options[panelNode.id]=nextStatePicker[panelNode.className];
	updateUrl(options);
}
function render(){
	var pageOptions = urlOptions2json();
	updatePanels(pageOptions);
}
function updatePanels(options){
	var panels = document.querySelectorAll('.hidden,.small,.big');
	for(var i in panels) if(options[panels[i].id]) panels[i].className = options[panels[i].id];
}
function updateUrl(options, newPageTitle){
	var pageOptions = urlOptions2json();
	for (var key in options) pageOptions[key] = options[key];
	if(newPageTitle) history.pushState(pageOptions,newPageTitle,'#'+JSON.stringify(pageOptions));
	else history.replaceState(pageOptions,document.title,'#'+JSON.stringify(pageOptions))
	render(); // fix hashchange not dispatched on pushState/replaceState
}
function urlOptions2json(){
	return window.location.hash?JSON.parse(decodeURIComponent(window.location.hash).substr(1)):{};
}
render();
