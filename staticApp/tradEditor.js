define(['./smartEvents', './ymlTools'], (ev, ymlTools) => {
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
		const tradData = getTradData();
		let formStr = '<form id="tradForm">';
		for (let key in tradData) {
			formStr += '<label>' + key + '<input name="' + key + '" value="' + tradData[key] + '" onchange="saveLocalTrad(this)"/></label>';
		}
		formStr += '<a id="trad2file" class="button">Sauvegarder le fichier de langue complet</a>';
		//formStr += '<a class="button" onclick="updateLang()">Appliquer localement</a>';
		formStr += '</form>';
		let details = document.querySelector("#details section");
		details.innerHTML = formStr;
		document.getElementById("trad2file").addEventListener('click', ()=>{
			ymlTools.exportAsFile("lang.yml", getTradData());
		});
	}

	function saveLocalTrad(e) {
		const tradData = getTradData();
		tradData[e.name] = e.value;
	}

	return {init};
});
