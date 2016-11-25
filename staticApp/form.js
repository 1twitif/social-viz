define([
	'./smartEvents',
	'./stringTools',
	'./languageLoader',
	'./structManipulation',
	'./MonitoredStruct'
], (ev, strTools, langTools) => {
	'use strict';
	const on = ev.on, send = ev.send, t = langTools.t;
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes
	function Form(tempateJson, data, targetNodes, id) {
		const formObject = this;
		let config = {};
		this.template = tempateJson || {};
		this.data = data || {};
		let entityId = id;
		const displayAnchors = {};
		for (let i in targetNodes) this.displayInNode(targetNodes[i]);
		on('config.selected change', (config) => formObject.edit(config.selected));

		this.render = ()=> {
			for(let anchor in displayAnchors) formObject.renderOn(displayAnchors[anchor]);
		};
		this.setTemplate = (template) => {
			formObject.template = template;
			formObject.render();
		};
		this.setConfig = (cfg) => {
			config = cfg;
			if(config.selected) entityId = config.selected;
			formObject.render();
		};
		this.setData = (data) => {
			formObject.data = data;
			formObject.render();
		};
		this.edit = function edit(id) {
			entityId = id;
			formObject.render();
		};
		this.displayInNode = function displayInNode(targetNode) {
			displayAnchors[targetNode] = targetNode;
			this.renderOn(targetNode);
		};

		this.renderOn = (targetNode)=> {
			targetNode.innerHTML = '';

			for (let form in formObject.template) if (form !== 'enum')
				((form) => {
					const btn = buildFormSelectorButton(form);
					targetNode.appendChild(btn);
					btn.addEventListener('click', () => {
						config.selected = form + '-new';
						formObject.renderOn(targetNode);
					});
				})(form);

			if (config.selected) {
				const form = config.selected.split('-')[0];
				const formNode = buildForm(formObject.template[form], form);
				targetNode.appendChild(formNode);
				send('form.updated', formObject);

			}

			//const nodeForm = document.createElement('form');
			// datalist http://www.alsacreations.com/article/lire/1334-html5-element-datalist.html
		};
		function buildFormSelectorButton(form) {
			const node = document.createElement('button');
			node.innerText = t(form);
			return node;
		}

		function buildForm(templateToBuild, title) {
			const formNode = document.createElement('form');
			formNode.appendChild(buildTitle(title));
			formNode.appendChild(buildId(entityId));
			for (let i in templateToBuild)
				if (templateToBuild.hasOwnProperty(i)) {
					formNode.appendChild(buildEntry(templateToBuild[i], entityId));
				}
			return formNode;
		}

		function buildId(dataId) {
			const idNode = document.createElement('input');
			idNode.setAttribute('name', 'id');
			idNode.setAttribute('value', dataId);
			idNode.setAttribute('disabled', true);

			const label = buildLabel('id');
			label.appendChild(idNode);
			return label;
		}

		function buildTitle(title) {
			return buildNode('h2', title);
		}

		function buildLabel(text) {
			return buildNode('label', text);
		}

		function buildNode(tag, textContent) {
			const node = document.createElement(tag);
			if (tag === 'input') node.value = textContent;
			else if (tag === 'textarea') node.innerText = textContent;
			else node.innerText = t(textContent);
			return node;
		}

		function buildEntry(rawEntry, dataId) {
			const entry = parseEntry(rawEntry);
			let node;
			const userContent = findData(dataId)[entry.name] || '';
			if (entry.dataType === 'markdown') node = buildNode('textarea', userContent);
			else node = buildNode('input', userContent);
			node.setAttribute('name', entry.name);
			node.addEventListener('change', formChange);

			for (let specificity in entry) applyEntrySpecificity(specificity,node,entry);

			const label = buildLabel(entry.name);
			label.appendChild(node);
			return label;
		}
		const entrySpecificityFuncs = {};
		function applyEntrySpecificity(specificity,node,entry){
			if(entrySpecificityFuncs[specificity]) entrySpecificityFuncs[specificity](node,entry);
		}
		entrySpecificityFuncs['from'] = (node,entry)=>{
			const id = dataListId(entry.from);
			node.setAttribute('list', id);
			const exist = document.getElementById(id);
			if(exist) exist.parentNode.removeChild(exist);
			document.body.appendChild(buildDataList(entry));
		};
		entrySpecificityFuncs['required'] = (node,entry)=>{
			node.setAttribute('required', entry.required);
		};
		entrySpecificityFuncs['dataType'] = (node,entry)=>{
			node.setAttribute('type', entry.dataType);
		};

		function getEnumFromTemplate(from) {
			const listPath = from.split('.');
			if (listPath[0] === 'enum') {
				let optionList = formObject.template.enum || {};
				for (let i = 1; i < listPath.length; i++) {
					optionList = optionList[listPath[i]];
				}
				return optionList;
			}
		}

		function buildStaticEnumDataList(optionList) {
			const dataList = document.createElement('datalist');
			for (let i = 0; i < optionList.length; i++) {
				const option = optionList[i];
				const optionNode = document.createElement('option');
				optionNode.innerText = t(option);
				optionNode.setAttribute('value', option);
				dataList.appendChild(optionNode);
			}
			return dataList;
		}

		function buildDynamicDataList(entityList) {
			const dataList = document.createElement('datalist');
			for (let i = 0; i < entityList.length; i++) {
				const option = entityList[i];
				const optionNode = document.createElement('option');
				optionNode.innerText = t(option.label);
				optionNode.setAttribute('value', option.id);
				dataList.appendChild(optionNode);
			}
			return dataList;
		}

		function buildDataList(entry) {
			let dataList;
			if (isStaticEnumRef(entry.from)) dataList = buildStaticEnumDataList(getEnumFromTemplate(entry.from));
			else dataList = buildDynamicDataList(formObject.data[entry.from] || {});
			dataList.setAttribute('id', dataListId(entry.from));
			return dataList;
		}

		function isStaticEnumRef(from) {
			return from.split('.')[0] === 'enum'
		}

		function generateId(type, title) {
			return strTools.clean(type + '-' + title + '-' + btoa(btoa(Math.random())).substr(8, 5));
		}

		function setIdWhenLabelIsStable(formNode) {
			let id = formNode.id.value;
			const labelNode = formNode.label;
			if (labelNode && labelNode.value) {
				if (id.split('-')[1] === 'new') {
					const formInputs = formNode.querySelectorAll('input,textarea');
					let timeToSetId = false;
					let afterLabel = false;
					for (let i = 0; i < Object.keys(formInputs).length; i++) {
						if (afterLabel && formInputs[i].value) timeToSetId = true;
						if (formInputs[i] === labelNode) afterLabel = true;
					}
					if (timeToSetId) {
						id = generateId(extractType(id), labelNode.value);
						formNode.id.setAttribute('value', id);
					}
				}
			}
		}

		function formChange(event) {
			const formNode = getAncestor(event.target, 'form');
			setIdWhenLabelIsStable(formNode);

			let id = formNode.id.value;
			if (canISave(id)) saveChangedData(id, event.target, formNode);
		}

		function canISave(id) {
			return id.split('-')[1] !== 'new';
		}

		function saveChangedData(id, changedNode, formNode) {
			const key = changedNode.name;
			let value = changedNode.value;
			if (!formObject.data[extractType(id)]) formObject.data[extractType(id)] = [];
			const data = findData(id);
			if (!data.id) {
				const formInputs = formNode.querySelectorAll('input,textarea');
				const newEntity = {};
				for (let i = 0; i < Object.keys(formInputs).length; i++)
					if (formInputs[i].value) newEntity[formInputs[i].name] = formInputs[i].value;
				formObject.data[extractType(id)].push(newEntity);
				send('new.data.' + extractType(id), id)
			}
			data[key] = value;
		}

		function findData(dataId) {
			if (!dataId) return {};
			const candidates = formObject.data[extractType(dataId)];
			if (candidates) return candidates.find((d) => d.id === dataId) || {};
			return {};
		}

		function extractType(dataId) {
			return dataId.split('-')[0];
		}

		function getAncestor(node, ancestorQuery) {
			if (node.parentNode.querySelector(ancestorQuery)) return node;
			if (node.parentNode === node || !node.parentNode) throw new SQLException('no ancestor matching : ' + ancestorQuery);
			return getAncestor(node.parentNode, ancestorQuery);
		}

		function parseEntry(entry) {
			if (typeof entry === 'string') return {'name': entry};
			for (let unicKey in entry) {
				entry[unicKey].name = unicKey;
				return entry[unicKey];
			}
		}

		function dataListId(rawStringId) {
			return strTools.clean('dataList-'+rawStringId);
		}

	}

	return {Form};
});
