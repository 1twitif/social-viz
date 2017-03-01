// affichage différencié de ce qui est affiché et masqué.
// liens transverseaux (voisins, selectionnable, catégorie survolable...)


define([
	'./smartEvents',
	'./htmlTools',
	'./trad/trad',
	'./json2dom'
], (ev, htmlTools, trad, json2dom) => {
	const buildNode = htmlTools.buildNode, t = trad.t;

	let anchorNotice;
	let config = {};
	let fullGraph = {};
	let displayedGraph = {};
	function init() {
		listenerInit();
		ev.after(['noticeView.conf.ok','noticeView.fullGraph.ok'],()=>{//,'legendView.displayedGraph.ok'],()=>{
			ev.send('noticeView.ready');
		});
		ev.need('config',(cfg)=>{
			config = cfg;
			anchorNotice = document.getElementById("details"); //fixme: depuis config
			ev.send('noticeView.conf.ok');
		});
		ev.need('fullGraph',(fG)=>{
			fullGraph = fG;
			ev.send('noticeView.fullGraph.ok');
		});
	}
	function listenerInit() {
		ev.on('noticeView.ready', renderNotice);
		ev.on('config.selected change', renderNotice);
		ev.on('config.userMode change', renderNotice);
	}
	function renderNotice(){
		if(config.userMode != "viz") return;

		if(!config.selected){
			anchorNotice.innerHTML = "<div class=header><h2>Tutoriel / Guide</h2></div><section class=wrapper></section><button class=reduce>-</button><button class=expand>+</button>";
			ev.send('noticeView.rendered');
			return;
		}

		const header = buildNode(".header");
		header.appendChild(buildNode("h2","notice_title"));

		const wrapper = buildNode("section.wrapper");

		const type = config.selected.split('-')[0];
		const selectedData = fullGraph[type].filter((item)=>item.id == config.selected)[0];
		for(let key in selectedData)if(key !== "id" && key !== "label" && key !== "source" && key !== "target"){
			const line = buildNode("div.line");
			line.appendChild(buildNode("span.label",key));
			line.appendChild(buildNode("span.content",selectedData[key]));
			wrapper.appendChild(line);
		}

		anchorNotice.innerHTML="";
		anchorNotice.appendChild(header);
		anchorNotice.appendChild(wrapper);
		anchorNotice.appendChild(buildNode('button.reduce','-'));
		anchorNotice.appendChild(buildNode('button.expand','+'));
		ev.send('noticeView.rendered');
	}
	return {
		init
	}
});
