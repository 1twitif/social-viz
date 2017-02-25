/*
Légende suivi d'un +/- pour basculer entre les styles
- épuré / détaillé

épuré :
bordure gauche profondeur de sous calque,
img, titre, +
+ -> +/- de déploiement
jauge de % de sous calques affiché en bordure droite.
calque vide non affichés.
si tout masqué, opacité à 0.2 pour l'image et le +, 0.5 pour le titre
au survol, à la place du titre, intitulé détaillé en défilant.

détaillés:
bordure gauche profondeur de sous calque,
img et en L2 aligné à droite nombre d'éléments sélectionné par le calque, L1: titre L2: intitulé détaillé (défilant au survol), L1: checkbox, L2 : +/- de déploiement
checkbox coché si tout les fils le sont, décoché si aucun, indeterminate sinon. Au clique, coche tout ou décoche si cochée.
jauge de % de sous calques affiché en bordure droite.
si calque vide (ne sélectionne rien), opacité à 0.5 pour tout sauf le titre en 0.7
si tout masqué, opacité à 0.2 pour l'image et le +, 0.5 pour le titre
au survol, étendre la ligne au dela du conteneur pour afficher à droite : L1 : sousCalquesAffichés/sousCalquesTotaux et L2 entitésIncluesAffichées/entitésInclues
 */


define([
	'../smartEvents',
	'../htmlTools',
	'../structManipulation',
	'../trad/trad',
	'../json2dom'
], (ev, htmlTools, struct, trad, json2dom) => {
	const buildNode = htmlTools.buildNode, t = trad.t;

	let legendAnchor;
	let config = {};
	let fullGraph = {};
	let displayedGraph = {};
	let scrollIncrement = 30;
	function init() {
		listenerInit();
		ev.after(['legendView.conf.ok','legendView.fullGraph.ok'],()=>{//,'legendView.displayedGraph.ok'],()=>{
			ev.send('legendView.ready');
		});
		ev.need('config',(cfg)=>{
			config = cfg;
			if(!config.hideLayers) config.hideLayers = {};
			if(!config.expandedLayers) config.expandedLayers = {};
			legendAnchor = document.getElementById(config.legendAreaId);
			ev.send('legendView.conf.ok');
		});
		ev.need('fullGraph',(fG)=>{
			fullGraph = fG;
			ev.send('legendView.fullGraph.ok');
		});

		ev.on("displayedGraph.filterTime",(graph)=>{
			const domLayerList = json2dom.json2dom(config.layers);
			for(let toHide in config.hideLayers){
				if(config.hideLayers[toHide]){
					let domGraph = json2dom.json2dom(graph);
					const hideCriterion = json2dom.xpath('//*[name="'+toHide+'"]/criterion/text()',domLayerList);
					const toRemove = json2dom.xpath(hideCriterion,domGraph,XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
					for(let item of toRemove){
						let id = item.querySelector('id').innerText;
						let type = id.split('-')[0];
						graph[type] = graph[type].filter((e)=>e.id !== id);
						if(type === "node"){
							graph.link = graph.link.filter((e)=>e.source !== id && e.target !== id);
						}
					}
				}
			}
		});

/*		ev.need('displayedGraph',(dG)=>{
			displayedGraph = dG;
			ev.send('legendView.displayedGraph.ok');
		});
		*/
	}
	function listenerInit() {
		//ev.on('legendView.conf.ok', renderLegend); //FIXME: supprimer ça et se brancher correctement sur le graph
		ev.on('legendView.ready', renderLegend);
	}
	function reset(){

	}

	function renderLegend(){
		const header = buildNode(".header");
		header.appendChild(buildNode("h2","legend_title"));

		const wrapper = buildNode(".wrapper");
		const scrollable = buildNode("ul");
		wrapper.appendChild(scrollable);

		scrollable.addEventListener("wheel", (e)=>{
			const wrapperHeight = wrapper.clientHeight;
			const scrollableHeight = scrollable.clientHeight;
			const maxScroll = scrollableHeight - wrapperHeight;
			const scrollCible = scrollable.offsetTop - (e.deltaY>0?scrollIncrement:-scrollIncrement);
			scrollable.style.top = Math.min(0,Math.max(- maxScroll,scrollCible)) + "px";
		});

		const layersData = insertLegendState(
			config.layers,
			config.hideLayers,
			config.expandedLayers,
			json2dom.json2dom(displayedGraph),
			json2dom.json2dom(fullGraph)
		);
		for(let layer of layersData){
			scrollable.appendChild(buildLegendEntry(layer));
		}


		const groupLayerLines = scrollable.querySelectorAll('.group>.layerLine');
		groupLayerLines.forEach((layerLine)=>{
			layerLine.addEventListener("click", (e)=>{
				if(e.target.localName != "input"){
					layerLine.parentNode.classList.toggle("expanded");
					const layerName = layerLine.parentNode.id.substring(5);
					config.expandedLayers[layerName] = config.expandedLayers[layerName] ? undefined : true;
				}
			});
		});
		const layerLines = scrollable.querySelectorAll('.layerLine');
		layerLines.forEach((layerLine)=>{
			layerLine.addEventListener("mouseover", partialHideNotConcerned);
			layerLine.addEventListener("mouseout", unhideAll);
		});

		//for(let child of legendAnchor.children) legendAnchor.removeChild(child);
		legendAnchor.innerHTML="";
		legendAnchor.appendChild(header);
		legendAnchor.appendChild(wrapper);

	}
	function buildLegendEntry(statedEntry) {
		//if(!statedEntry.state.matchedEntities) return buildNode(".empty");
		const entryNode = buildNode('li.layer#layer'+statedEntry.name);
		if(!statedEntry.state.displayedLayer) entryNode.classList.add("hidden");
		if(statedEntry.expanded) entryNode.classList.add("expanded");
		if(!statedEntry.state.matchedEntities) entryNode.classList.add("empty");


		const final = !statedEntry.hasOwnProperty('sub');
		if(final) entryNode.classList.add("final");
		else entryNode.classList.add("group");

		const layerLine = final?buildNode('label.layerLine'):buildNode('.layerLine');
		entryNode.appendChild(layerLine);

		const left = buildNode('.left');
		layerLine.appendChild(left);

		const icon = buildNode('img');
		icon.addEventListener('error',build_imageLoadErrorPlaceOverFunc(statedEntry.name));
		icon.src = config.layersPictoFolder+statedEntry.name+".svg";
		left.appendChild(icon);

		const entityCount = buildNode(".layerEntityCount");
		entityCount.innerText = statedEntry.state.displayedEntities;
		if(statedEntry.state.displayedEntities != statedEntry.state.matchedEntities)
			entityCount.innerText = statedEntry.state.displayedEntities + " / " + statedEntry.state.matchedEntities;
		entityCount.title = t("infoBox_layerEntityCount");
		left.appendChild(entityCount);

		const middle = buildNode('.middle');
		layerLine.appendChild(middle);

		const layerName = buildNode('h3.title', statedEntry.name);
		middle.appendChild(layerName);

		const right = buildNode('.right');
		layerLine.appendChild(right);

		const checkbox = buildNode('input');
		checkbox.type = "checkbox";
		checkbox.name = statedEntry.name;
		if(statedEntry.state.displayedLayer !== 0 && statedEntry.state.displayedLayer < statedEntry.state.includedLayer)
			checkbox.indeterminate = true;
		if(statedEntry.state.displayedLayer !== 0 && statedEntry.state.displayedLayer === statedEntry.state.includedLayer)
			checkbox.checked = true;
		checkbox.addEventListener('change',layerToggle);
		right.appendChild(checkbox);

		if(!final){
			right.appendChild(buildNode('.unfold',"+"));//could be an icon;
			right.appendChild(buildNode('.fold',"-"));//could be an icon;

			const jauge = buildNode('.jauge');
			jauge.title = statedEntry.state.displayedLayer+" / "+statedEntry.state.includedLayer+" "+t("infoBox_subLayerCount");
			layerLine.appendChild(jauge);

			const jaugeLevel = buildNode('.fill');
			jaugeLevel.style.height = Math.round(100*statedEntry.state.displayedLayer/statedEntry.state.includedLayer)+"%";
			jauge.appendChild(jaugeLevel);
		}
		if(t("layerDetails_"+statedEntry.name) !== "layerDetails_"+statedEntry.name){
			const rightExtension = buildNode('.rightExtension');
			rightExtension.appendChild(buildNode(".detail","layerDetails_"+statedEntry.name));
			layerLine.appendChild(rightExtension);
		}
		if(!final){
			const subContainer = buildNode('ul.subLayers');
			entryNode.appendChild(subContainer);
			for(let sub of statedEntry.sub){
				subContainer.appendChild(buildLegendEntry(sub));
			}
		}
		return entryNode;
	}
	function insertLegendState(layers,hiddenList,expandedList,visibleGraphDom, fullGraphDom){
		const statedLayers = struct.clone(layers);
		for(let layer of statedLayers){
			if(layer.sub){
				layer.sub = insertLegendState(layer.sub,hiddenList,expandedList,visibleGraphDom, fullGraphDom);
				layer.state = layer.sub.reduce( (res,l)=>{
					for(let key in l.state) res[key] = res[key] ? l.state[key]+res[key] : l.state[key];
					return res;
				}, {});
				layer.expanded = expandedList[layer.name];
			} else{
				layer.state = {};
				layer.state.displayedLayer = hiddenList[layer.name]?0:1;
				layer.state.includedLayer = 1;
			//TODO: query visibleGraphDom and fullGraphDom for proper result

				layer.state.matchedEntities = json2dom.xpath(layer.criterion,fullGraphDom,XPathResult.UNORDERED_NODE_ITERATOR_TYPE).length;
				layer.state.displayedEntities = hiddenList[layer.name]?0:layer.state.matchedEntities;
			}
		}
		return statedLayers;
	}
	function build_imageLoadErrorPlaceOverFunc(id){
		return (e)=>{
			//FIXME: if svg fail -> png, if png fail -> identicon
			//https://github.com/davidbau/seedrandom

			//https://www.khanacademy.org/computer-programming/random-face-generator/6612995667394560
			//http://svgavatars.com/
			//http://bl.ocks.org/enjalot/1282943
			//https://github.com/alexvandesande/blockies
			//https://github.com/dmester/jdenticon
			// default image
			e.target.src = config.defaultPicto;
		}
	}
	function layerToggle(e){
		const layerNode = getLayerParentNodeFromEvent(e);
		const layerName = layerNode.id.substring(5);
		if(layerNode.classList.contains("final")){
			config.hideLayers[layerName] = config.hideLayers[layerName] ? undefined : true;
		} else {
			const descendants = layerNode.querySelectorAll('.layer.final');
			const hiddenDescendants = layerNode.querySelectorAll('.layer.hidden.final');
			let hideDescendants = undefined;
			if(hiddenDescendants.length !== descendants.length) hideDescendants = true;
			for(let item of descendants)
				config.hideLayers[item.id.substring(5)] = hideDescendants;
		}
		renderLegend();
		ev.send("fullGraph.change",fullGraph);
	}

	function getLayerParentNodeFromEvent(e){
		const ancestors = json2dom.xpath('ancestor::li[contains(@class,"layer")]',e.target,XPathResult.ORDERED_NODE_ITERATOR_TYPE);
		const layerNode = ancestors[ancestors.length-1];
		return layerNode;
	}
	function partialHideNotConcerned(e) {
		const layerNode = getLayerParentNodeFromEvent(e);
		const layerName = layerNode.id.substring(5);
		document.querySelectorAll('.node,.link').forEach((n)=>n.classList.add("nearlyHidden"));
		document.querySelectorAll('.node[class*="'+layerName+'"],.link[class*="'+layerName+'"]').forEach(
			(n)=>n.classList.remove("nearlyHidden")
		);
	}

	function unhideAll(e) {
		document.querySelectorAll('.node,.link').forEach((n)=>n.classList.remove("nearlyHidden"));
	}

	return {
		init,
		reset,
		renderLegend,
		buildLegendEntry
	}
});
