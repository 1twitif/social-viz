define([], () => {
	'use strict';
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes
	function evaluate(conditionString, formData, dataBase, template, formName) {
		if (!dataBase) dataBase = {};
		if (!formData) formData = {};
		return isConditionOk(conditionString, formData, dataBase);
	}

	function isConditionOk(condition, formData, dataBase) {
		const operand = operandFinder(condition);
		const conditionPart = condition.split(operand);
		const dataRef = followRef(conditionPart[0].trim(), formData, dataBase);
		const expectedValue = conditionPart[1].trim();
		return operands[operand](dataRef, expectedValue);
	}

	function followRef(dataRef, formData, dataBase) {
		const refParts = dataRef.split('.');
		//if(refParts[0] == "enum") return getEnumFromTemplate(dataRef, template); // template innaccessible d'ici
		if (!formData.hasOwnProperty(refParts[0])) return dataRef;
		let ref = refParts.shift();
		let linkedData = formData[ref] ;
		while (ref = refParts.shift()) linkedData = findDataIn(linkedData, dataBase)[ref];
		return linkedData;
	}

	function findDataIn(dataId, dataBase) {
		if (!dataId) return {};
		const candidates = dataBase[extractType(dataId)];
		if (candidates) return candidates.find((d) => d.id === dataId) || {};
		return {};
	}

	function extractType(dataId) {
		return dataId.split('-')[0];
	}

	function getEnumFromTemplate(refString, template) {
		const listPath = refString.split('.');
		let optionList = template.enum;
		for (let i = 1; i < listPath.length; i++) optionList = optionList[listPath[i]];
		return optionList;
	}

	const operands = {};
	operands['='] = (a, b) => a === b;
	operands['!='] = (a, b) => a !== b;
	operands['>='] = (a, b) => parseFloat(a) >= parseFloat(b);
	operands['<='] = (a, b) => parseFloat(a) <= parseFloat(b);
	operands['>'] = (a, b) => parseFloat(a) > parseFloat(b);
	operands['<'] = (a, b) => parseFloat(a) < parseFloat(b);
	operands['^='] = (a, b) => a.substring(0, b.length) === b;
	operands['$='] = (a, b) => a.substr(-b.length) === b;
	operands['*='] = (a, b) => a.indexOf(b) !== -1;

	function escapeRegExp(string) {
		return string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
	}

	function operandFinder(condition) {
		let tabKey = [];
		for (let operand in operands) tabKey.push(escapeRegExp(operand));
		const regexp = new RegExp('(' + tabKey.join('|') + ')');
		return condition.match(regexp)[0];
	}

	return {evaluate};
});
