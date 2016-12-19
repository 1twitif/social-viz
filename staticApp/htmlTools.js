define([
	"./tradRenderer"
], (tradR) => {
	const t = tradR.t;
	'use strict';

	function buildNode(tag, textContent) {
		const node = document.createElement(tag);
		if (tag === 'input') node.value = textContent;
		else if (tag === 'textarea') node.innerText = textContent;
		else if (typeof textContent !== "undefined") node.innerText = t(textContent);
		return node;
	}
	function buildLangPicker(langs, activeLang){
		const form = buildNode('form');
		form.setAttribute('id','langPickerForm');
		for(let i in langs) {
			const input = buildNode('input',langs[i])
			if(langs[i]===activeLang) input.checked = true;
			input.setAttribute('type','radio');
			input.setAttribute('name','lang');
			const label = buildNode('label');
			const labelContent = buildNode('span','lang-'+langs[i]);
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
		for (let i in nodes) {
			if (nodes.hasOwnProperty(i)) {
				const n = nodes[i];
				if (condition(n)) {
					appliedTimes++;
					n.classList.add(className);
				} else n.classList.remove(className);
			}
		}
		return appliedTimes;
	}

	return {buildNode, buildLangPicker, addOrReplace, addOnce, applySelectiveClassOnNodes}
});
