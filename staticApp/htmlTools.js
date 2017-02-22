define([
	"./trad/tradRenderer"
], (tradR) => {
	const t = tradR.t;

	function buildNode(tag, textContent) {
		let realTag = "div";
		if(tag){
			const tagFound = tag.match(/^[^.#]+/);
			if(tagFound) realTag = tagFound[0];
		}
		const node = document.createElement(realTag);
		if(tag) {

			// add id
			const idFound = tag.match(/#[^.#]+/);
			if (idFound) node.id = idFound[0].substring(1);

			//add classes
			const classes = tag.match(/\.[^.#]+/g);
			if (classes) classes.forEach((c) => node.classList.add(c.substring(1)));
		}

		//content builder
		if (realTag === 'input') node.value = textContent;
		else if (realTag === 'textarea') node.innerText = textContent;
		else if (typeof textContent !== "undefined") node.innerText = t(textContent);

		return node;
	}
	function buildLangPicker(langs, activeLang){
		const form = buildNode('form');
		form.setAttribute('id','langPickerForm');
		for(let lang of langs) {
			const input = buildNode('input',lang);
			if(lang===activeLang) input.checked = true;
			input.setAttribute('type','radio');
			input.setAttribute('name','lang');
			const label = buildNode('label');
			const labelContent = buildNode('span','lang-'+lang);
			label.appendChild(input);
			label.appendChild(labelContent);
			form.appendChild(label);
		}
		return form;
	}
	function addOrReplace(me,here){
		const used = here.querySelector('#'+me.id);
		if(used)here.removeChild(used);
		here.appendChild(me);
	}
	function addOnce(me,here){
		if(!here.querySelector('#'+me.id)) here.appendChild(me);
	}

	function applySelectiveClassOnNodes(nodes, className, condition) {
		let appliedTimes = 0;
		for (let n of nodes) {
			if (condition(n)) {
				appliedTimes++;
				n.classList.add(className);
			} else n.classList.remove(className);
		}
		return appliedTimes;
	}

	return {buildNode, buildLangPicker, addOrReplace, addOnce, applySelectiveClassOnNodes}
});
