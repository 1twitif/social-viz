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
		let config;
		this.template = tempateJson;
		this.data = data || {};
		let entityId = id;
		const displayAnchors = {};
		for (let i in targetNodes) this.displayInNode(targetNodes[i]);
		on('config.selected change', (config) => formObject.edit(config.selected));

		this.setTemplate = (template) => this.template = template;
		this.setConfig = (cfg) => config = cfg;
		this.setData = (data) => this.data = data;
		this.edit = function edit(id) {
			entityId = id;
			// send event ou refresh render directe
		};
		this.displayInNode = function displayInNode(targetNode) {
			displayAnchors[targetNode] = targetNode;
			this.render(targetNode);
		};

		this.render = function render(targetNode) {
			targetNode.innerHTML = '';

			for (let form in formObject.template) if (form !== 'enum')
				((form) => {
					const btn = buildFormSelectorButton(form);
					targetNode.appendChild(btn);
					btn.addEventListener('click', () => {
						config.selected = form + '-new';
						render(targetNode);
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
			if(tag==='input') node.value = textContent;
			else if(tag==='textarea')node.innerText = textContent;
			else node.innerText = t(textContent);
			return node;
		}

		function buildEntry(rawEntry, dataId) {
			const entry = parseEntry(rawEntry);
			let node;
			const userContent = findData(dataId)[entry.name] || '';
			if (entry.options.dataType === 'markdown') node = buildNode('textarea', userContent);
			else node = buildNode('input', userContent);
			node.setAttribute('name', entry.name);
			node.addEventListener('change', formChange);

			const label = buildLabel(entry.name);
			label.appendChild(node);

			if (entry.options.dataType !== 'markdown') node.setAttribute('type', entry.options.dataType ? entry.options.dataType : config.form.entryDefault.dataType);
			if (entry.options.required) node.setAttribute('required', entry.options.required);
			if (entry.options.from) {
				const listId = legalId(entry.options.from);
				node.setAttribute('list', listId);

				const dataList = document.createElement('datalist');
				dataList.setAttribute('id', listId);
				label.appendChild(dataList);
				const listPath = entry.options.from.split('.');
				if (listPath[0] === 'enum') {
					let optionList = formObject.template.enum;
					for (let i = 1; i < listPath.length; i++) {
						optionList = optionList[listPath[i]];
					}
					for (let i = 0; i < optionList.length; i++) {
						const option = optionList[i];
						const optionNode = document.createElement('option');
						optionNode.innerText = t(option);
						optionNode.setAttribute('value', option);
						dataList.appendChild(optionNode);
					}
				} else if (typeof formObject.data[listPath[0]] !== 'undefined') {
					const data = formObject.data[listPath[0]];
					for (let i = 0; i < data.length; i++) {
						const option = data[i];
						const optionNode = document.createElement('option');
						optionNode.innerText = t(option.label);
						optionNode.setAttribute('value', option.id);
						dataList.appendChild(optionNode);
					}
				} else console.log('from non reconnu : ', entry.options.from);
			}
			return label;
		}

		function formChange(event) {
			const formNode = getAncestor(event.target, 'form');
			const idNode = formNode.querySelector('input[name="id"]');
			let id = idNode.value;

			const labelNode = formNode.querySelector('input[name="label"]');
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
						const label = labelNode.value;
						id = strTools.clean(extractType(id) + '-' + label + '-' + btoa(btoa(Math.random())).substr(8, 5));
						idNode.setAttribute('value', id);
					}
				}
			}
			if(id.split('-')[1]!=='new'){
				const key = event.target.name;
				let value = event.target.value;
				if(!formObject.data[extractType(id)]) formObject.data[extractType(id)] = {};
				const collection = formObject.data[extractType(id)];
				if(!collection[id]){
					const formInputs = formNode.querySelectorAll('input,textarea');
					const newEntity = {};
					for (let i = 0; i < Object.keys(formInputs).length; i++) {
						if (formInputs[i].value) newEntity[formInputs[i].name] = formInputs[i].value;
						collection[id] = newEntity;
						send('new.data.' + extractType(id), id)
					}
				}
				collection[id][key] = value;
			}
		}

		function findData(dataId){
			if (!dataId) return {};
			const candidates = formObject.data[extractType(dataId)];
			//if(candidates) return candidates.find((d)=>d.id===dataId) || {};
			if(candidates) return candidates[dataId] || {};
			return {};
		}
		function extractType(dataId){
			return dataId.split('-')[0];
		}
		function getAncestor(node, ancestorQuery) {
			if (node.parentNode.querySelector(ancestorQuery)) return node;
			if (node.parentNode === node || !node.parentNode) throw new SQLException('no ancestor matching : ' + ancestorQuery);
			return getAncestor(node.parentNode, ancestorQuery);
		}

		function parseEntry(entry) {
			if (typeof entry === 'string') return {'name': entry, 'options': {}};
			for (let unicKey in entry) return {'name': unicKey, 'options': entry[unicKey]};
		}

		function legalId(rawStringId) {
			return rawStringId.replace(/[^a-zA-Z]/g, '');
		}
	}

	return {Form};
});
