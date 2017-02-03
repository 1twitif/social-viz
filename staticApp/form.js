define([
	'./smartEvents',
	'./stringTools',
	'./htmlTools',
	'./conditionEvaluator',
	'./trad/trad'
], (ev, strTools, htmlTools,condiEval, trad) => {
	'use strict';
	const on = ev.on, send = ev.send, t = trad.t, buildNode = htmlTools.buildNode;
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes
	function Form(tempateJson, data) {
		const formObject = this;
		let config = {};
		this.template = tempateJson || {};
		this.data = data || {};
		const displayAnchors = {};
		on('config.selected change', (config) => formObject.edit(config.selected));
		on('form.if', runIfTriggers);

		this.render = () => {
			for (let anchor in displayAnchors) formObject.renderOn(displayAnchors[anchor]);
		};
		this.setTemplate = (template) => {
			formObject.template = template;
			formObject.render();
		};
		this.setConfig = (cfg) => {
			config = cfg;
			formObject.render();
		};
		this.setData = (data) => {
			formObject.data = data;
			formObject.render();
		};
		this.edit = function edit(id) {
			config.selected = id;
			formObject.render();
		};
		this.displayInNode = function displayInNode(targetNode) {
			displayAnchors[targetNode] = targetNode;
			this.renderOn(targetNode);
		};

		this.renderOn = (targetNode) => {
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
				const form = extractType(config.selected);
				const formNode = buildForm(formObject.template[form], form);
				targetNode.appendChild(formNode);
				runIfTriggers();
				send('form.updated', formObject);

			}
		};
		function buildForm(templateToBuild, title) {
			const formNode = buildNode('form');
			formNode.appendChild(buildNode('h2', title));
			formNode.appendChild(buildId(config.selected));
			for (let i in templateToBuild) formNode.appendChild(buildEntry(templateToBuild[i], config.selected));
			return formNode;
		}

		function buildFormSelectorButton(form) {
			const node = document.createElement('button');
			node.innerText = t(form);
			return node;
		}

		function buildId(dataId) {
			const idNode = document.createElement('input');
			idNode.setAttribute('name', 'id');
			idNode.setAttribute('value', dataId);
			idNode.setAttribute('disabled', true);

			const label = buildNode('label', 'id');
			label.appendChild(idNode);
			return label;
		}

		function buildEntry(rawEntry, dataId) {
			const entry = parseEntry(rawEntry);
			if(entry.name === 'if') return buildIf(entry);
			let node;
			const entryData = findData(dataId)[entry.name] || '';
			if (entry.dataType === 'markdown') node = buildNode('textarea', entryData);
			else node = buildNode('input', entryData);
			node.setAttribute('name', entry.name);
			node.addEventListener('change', formChange);
			node.addEventListener('input', runIfTriggers);


			for (let specificity in entry) applyEntrySpecificity(specificity, node, entry);

			const label = buildNode('label',entry.name);
			label.appendChild(node);
			return label;
		}

		function buildIf(ifTemplate){
			const ifAnchor = document.createElement('div');
			ifAnchor.setAttribute('class','ifAnchor');
			const ifId = generateId('if');
			ifAnchor.setAttribute('id',ifId);
			const ifTrigger = buildIfTrigger(ifTemplate, ifId);
			registerIfTrigger(ifTrigger, ifId);
			return ifAnchor;
		}
		function buildIfTrigger(ifTemplate,ifId){
			return ()=>{
				const ifAnchor = document.getElementById(ifId);
				const formNode = getAncestor(ifAnchor,'form');
				const formData = domForm2json(formNode);
				if( condiEval.evaluate(ifTemplate.condition, formData, formObject.data, formObject.template) ){
					if(!ifAnchor.innerHTML){
						for (let entry of ifTemplate.then) ifAnchor.appendChild(buildEntry(entry, config.selected));
						send('form.if.displayed', ifId);
					}
				} else {
					ifAnchor.innerHTML = '';
				}
			}
		}
		const ifTriggerList = {};
		function registerIfTrigger(ifTrigger,ifId){
			ifTriggerList[ifId] = ifTrigger;
		}
		function runIfTriggers(){
			for(let ifId in ifTriggerList){
				if(document.getElementById(ifId)) ifTriggerList[ifId]();
				else delete ifTriggerList[ifId];
			}
		}

		const entrySpecificityFuncs = {};

		function applyEntrySpecificity(specificity, node, entry) {
			if (entrySpecificityFuncs[specificity]) entrySpecificityFuncs[specificity](node, entry);
		}

		entrySpecificityFuncs['from'] = (node, entry) => {
			const id = dataListId(entry.from);
			node.setAttribute('list', id);
			const dataList = getDataList(entry);
			const htmlDataList = buildFromDataList(dataList, id);
			htmlTools.addOrReplace(htmlDataList,document.body);
		};
		entrySpecificityFuncs['required'] = (node, entry) => {
			node.setAttribute('required', entry.required);
		};
		entrySpecificityFuncs['dataType'] = (node, entry) => {
			node.setAttribute('type', entry.dataType);
		};
		entrySpecificityFuncs['autoCalc'] = (node, entry) => {
			const formula = entry.autoCalc;
			const formulaParts = formula.split(' ');
			const updateFunc = ()=>{
				let autoCalcValue = [];
				for(let part of formulaParts){
						autoCalcValue.push(document.querySelector('[name="'+part+'"]').value);
				}
				ev.changeInputValue(node, autoCalcValue.join(' ').trim());
				//TODO: gérer l'écrasement ou non des données utilisateur
				//TODO: indiquer le pattern quand le champ est vide
			};
			for(let part of formulaParts){
				((part)=> setTimeout(()=>{
						document.querySelector('[name="'+part+'"]').addEventListener('input', updateFunc);
					},0) )(part);
			}
		};
		function getEnumFromTemplate(from) {
			const listPath = from.split('.');
			let optionList = formObject.template.enum;
			for (let i = 1; i < listPath.length; i++) optionList = optionList[listPath[i]];
			return optionList;
		}

		function getDataList(entry) {
			let source,method;
			if (isStaticEnumRef(entry.from)){
				source = getEnumFromTemplate(entry.from);
				method = (map,item)=>map[item]=item ;
			} else {
				source = formObject.data[entry.from] || [];
				method = (map,item)=>map[item.id]=item.label ;
			}
			return convertDataList(source,method);
		}
		function convertDataList(dataSource,conversionFunc){
			const map = {};
			for(let i = 0; i < dataSource.length;i++) conversionFunc(map,dataSource[i]);
			return map;
		}

		function buildFromDataList(dataList, id) {
			const html = document.createElement('datalist');
			for (let key in dataList) {
				let value = dataList[key];
				const optionNode = document.createElement('option');
				optionNode.innerText = t(value);
				optionNode.setAttribute('value', key);
				html.appendChild(optionNode);
			}
			html.setAttribute('id', id);
			return html;
		}

		function formChange(event) {
			const formNode = getAncestor(event.target, 'form');
			setIdWhenLabelIsStable(formNode);
			const id = formNode.id.value;
			if (canISave(id)) saveChangedData(id, event.target, formNode);
		}


		function saveChangedData(id, changedNode, formNode) {
			const key = changedNode.name;
			let value = changedNode.value;
			if (!formObject.data[extractType(id)]) formObject.data[extractType(id)] = [];
			const data = findData(id);
			if (!data.id) {
				const newEntity = domForm2json(formNode);
				formObject.data[extractType(id)].push(newEntity);
				send('new.data.' + extractType(id), id)
			}
			data[key] = value;
		}
		function domForm2json(formNode){
			const formInputs = formNode.querySelectorAll('input,textarea');
			const json = {};
			for (let i = 0; i < Object.keys(formInputs).length; i++)
				if (formInputs[i].value) json[formInputs[i].name] = formInputs[i].value;
			return json;
		}

		function findData(dataId) {
			if (!dataId) return {};
			const candidates = formObject.data[extractType(dataId)];
			if (candidates) return candidates.find((d) => d.id === dataId) || {};
			return {};
		}
	}

	// independent utility functions
	function setIdWhenLabelIsStable(formNode) {
		let id = formNode.id.value;
		const labelNode = formNode.label;
		if (labelNode && labelNode.value && isCreationTempId(id) && isAfterLabelValue(formNode)) {
			id = generateId(extractType(id), labelNode.value);
			formNode.id.setAttribute('value', id);
		}
	}

	function isAfterLabelValue(formNode) {
		let timeToSetId = false;
		let afterLabel = false;
		const formInputs = formNode.querySelectorAll('input,textarea');
		for (let i = 0; i < Object.keys(formInputs).length; i++) {
			if (afterLabel && formInputs[i].value) timeToSetId = true;
			if (formInputs[i] === formNode.label) afterLabel = true;
		}
		return timeToSetId;
	}

	function getAncestor(node, ancestorQuery) {
		if (node.parentNode.querySelector(ancestorQuery)) return node;
		return getAncestor(node.parentNode, ancestorQuery);
	}

	function parseEntry(entry) {
		if (typeof entry === 'string') return {'name': entry};
		for (let unicKey in entry) {
			entry[unicKey].name = unicKey;
			return entry[unicKey];
		}
	}

	function isStaticEnumRef(from) {
		return from.split('.')[0] === 'enum'
	}

	function generateId(type, title) {
		if(!title) title = '';
		return strTools.clean(type + '-' + title + '-' + btoa(btoa(Math.random())).substr(8, 5));
	}

	function isCreationTempId(id) {
		return id.split('-')[1] === 'new'
	}

	function canISave(id) {
		return !isCreationTempId(id);
	}

	function extractType(dataId) {
		return dataId.split('-')[0];
	}

	function dataListId(rawStringId) {
		return strTools.clean('dataList-' + rawStringId);
	}

	return {Form};
});
