define(['./smartEvents', './htmlTools', './ymlTools'], (ev, htmlTools, ymlTools) => {
	let config, getTradData;
	function init() {
		ev.after(['tradEditor.conf.ok', 'tradEditor.tradLoader.ok', 'trad.applied'],()=>{
			ev.on("config.userMode change",chooseToRenderTradForm);
			chooseToRenderTradForm();
		});
		ev.need('config',(cfg)=>{
			config = cfg;
			const traductionModeButtonId = cfg.trad.tradModeTriggerId;
			const node = document.getElementById(traductionModeButtonId);
			if (node) node.addEventListener('click', activateUserModeTrad);

			ev.send('tradEditor.conf.ok');
		});
		ev.need("tradLoader",(nsTradLoader)=>{
			getTradData = nsTradLoader.getTradData;
			ev.send('tradEditor.tradLoader.ok');
		});
	}

	function activateUserModeTrad() {
		config.userMode = "trad";
	}
	function chooseToRenderTradForm(){
		if(config.userMode === "trad") renderTradForm();
	}

// TODO: gros refacto pour utiliser form.js et ymlTools.exportAsFile();
	function renderTradForm() {
		const buildNode = htmlTools.buildNode;
		const tradData = getTradData();
		const formNode = buildNode('form');
		formNode.id = "tradForm";
		formNode.appendChild(buildNode('h2', "formulaire de traduction"));

		for (let key in tradData) {
			const input = buildNode("input",tradData[key]);
			input.name = key;
			input.addEventListener('change', saveLocalTrad);

			const label = document.createElement("label")
			label.innerText = key;
			label.appendChild(input);
			formNode.appendChild(label);
		}

		const trad2file = buildNode("a","Sauvegarder le fichier de langue complet");
		trad2file.class = "button";
		trad2file.addEventListener('click', ()=>{
			ymlTools.exportAsFile("lang", getTradData());
		});
		//return formNode;

		let details = document.querySelector(config.trad.formAnchorSelector);
		details.innerHTML = "";
		details.appendChild(formNode);
	}

	function saveLocalTrad(event) {
		const tradData = getTradData();
		const node = event.target;
		tradData[node.name] = node.value;
	}

	return {init};
});
