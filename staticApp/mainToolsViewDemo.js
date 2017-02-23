define([
	'smartEvents',
	'htmlTools'
], (ev, htmlTools) => {
	const buildNode = htmlTools.buildNode;
	let anchorMainTools;
	let config = {};
	function init() {
		ev.need('config',(cfg)=>{
			config = cfg;
			anchorMainTools = document.getElementById("main-tools");//config.legendAreaId);
			renderMainTools();
			bindButton('vizModeButton',switchToVizMode);//FIXME: ça devrait être dans la config ça !
			ev.send('mainToolsView.ready');
		});

	}
function bindButton(id,action){
	const node = document.getElementById(id);
	if (node) node.addEventListener('click', action);
}
function switchToVizMode() {
	config.userMode = "viz";
}
	function renderMainTools(){
		const left = buildNode(".left");
		left.appendChild(buildNode("h1","Filières du recyclage"));//"legend_title"));
		left.appendChild(buildNode("#loginButton.pictoButton.ghost"));
		left.appendChild(buildNode("#emailButton.pictoButton.ghost"));
		left.appendChild(buildNode("#faqButton.pictoButton.ghost"));
		left.appendChild(buildNode("#alertsButton.pictoButton.ghost"));

		const right = buildNode(".right");
		right.appendChild(buildNode("#visuButton.pictoButton.ghost"));
		right.appendChild(buildNode("#vizModeButton.pictoButton"));
		right.appendChild(buildNode("#editModeButton.pictoButton"));
		right.appendChild(buildNode("#diagramGenButton.pictoButton.ghost"));
		right.appendChild(buildNode("#printButton.pictoButton.ghost"));
		right.appendChild(buildNode("#exportData.pictoButton"));

		const search = buildNode("label#search.ghost");
		search.appendChild(buildNode(".decoSearch"));
		const searchField = buildNode("input","");
		searchField.type = "search";
		searchField.placeholder = "Rerchercher...";

		search.appendChild(searchField);
		right.appendChild(search);

		//right.appendChild(buildNode("#fakeLang.pictoButton.ghost"));

		anchorMainTools.innerHTML="";
		anchorMainTools.appendChild(left);
		anchorMainTools.appendChild(right);

	}

	return {
		init
	}
});
