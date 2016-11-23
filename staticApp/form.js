define([
	'./smartEvents',
	'./languageLoader',
	'./structManipulation',
	'./MonitoredStruct'
], (ev, langTools) => {
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
			if (config.form.active) {
				const form = config.form.active;
				const formNode = buildForm(formObject.template[form], form);
				targetNode.innerHTML = '';
				targetNode.appendChild(formNode);
				send('form.updated', formObject);

			} else {
				targetNode.innerHTML = '';
				for (let form in this.template) if (form !== 'enum')
					((form) => {
						const btn = buildFormSelectorButton(form);
						targetNode.appendChild(btn);
						btn.addEventListener('click', () => {
							config.form.active = form;
							render(targetNode);
						});

					})(form);
			}

			//const nodeForm = document.createElement('form');
			// datalist http://www.alsacreations.com/article/lire/1334-html5-element-datalist.html
		};
		function buildFormSelectorButton(form) {
			const node = document.createElement('button');
			node.innerText = t(form);
			return node;
		}

		function buildForm(templateToBuild, title, dataId) {
			const formNode = document.createElement('form');
			const titleNode = document.createElement('h2');
			titleNode.innerText = t(title);
			formNode.appendChild(titleNode);
			for (let i in templateToBuild)
				if (templateToBuild.hasOwnProperty(i)) {
					formNode.appendChild(buildEntry(templateToBuild[i], dataId));
				}
			return formNode;
		}

		function buildEntry(rawEntry, dataId) {
			const entry = parseEntry(rawEntry);
			let node;
			if (entry.options.dataType === 'markdown') node = document.createElement('textarea');
			else node = document.createElement('input');
			node.setAttribute('name', entry.name);

			const label = document.createElement('label');
			label.innerText = t(entry.name);
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
				} else if(typeof formObject.data[listPath[0]] !== 'undefined'){
					const data = formObject.data[listPath[0]];
					for (let i = 0; i < data.length; i++) {
						const option = data[i];
						const optionNode = document.createElement('option');
						optionNode.innerText = t(option.label);
						optionNode.setAttribute('value', option.id);
						dataList.appendChild(optionNode);
					}
				} else console.log('from non reconnu : ',entry.options.from);
			}
			return label;
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
