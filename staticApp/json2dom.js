define([], () => {
	function json2dom(jsObj, parent = document.createElement('root')) {
		for(let key in jsObj) {
			const value = jsObj[key];
			const child = __createTag(key);
			parent.appendChild(__fillMeWith(value,child));
			__specialKeys(key,value,parent);
		}
		return parent;
	}
	function __createTag(key){
		if (isNaN(key - 0)) return document.createElement(key);
		return document.createElement('array-item');
	}
	function __fillMeWith(value,me){
		if(typeof value === 'object' && value !== null) json2dom(value,me);
		else me.innerHTML = value;
		return me;
	}
	function __specialKeys(key,value,parent) {
		if(key === "id") parent.id = value;
		if(key === "class") parent.setAttribute("class",value);
	}
	function dom2json(domObj) {
		let parent = {};
		if(domObj.firstElementChild.localName === "array-item") parent = [];
		for(let domNode of domObj.children) {
			let child;
			if(domNode.children.length) child = dom2json(domNode);
			else child = autoType(domNode.innerText);
			if(domNode.localName === "array-item") parent.push(child);
			else parent[domNode.localName] = child;
		}
		return parent;
	}
	function autoType(string) {
		if(!isNaN(string-0)) return string-0;
		if(string==='true') return true;
		if(string==='false') return false;
		return string;
	}
	function xpath(xPathQuery,element, resultType=XPathResult.ANY_TYPE){
		let oldXPath;
		do{
			oldXPath = xPathQuery;
			xPathQuery = xPathQuery.replace(/{[^{}]+}/g,(x)=>simpleXpath(x.substring(1,x.length-1),element,resultType));
		} while (oldXPath !== xPathQuery);
		return simpleXpath(xPathQuery,element,resultType);
	}
	function simpleXpath(xPathQuery,element, resultType=XPathResult.ANY_TYPE){
		const doc = element.ownerDocument;
		const rawXPathResult = doc.evaluate(xPathQuery,element,nameSpaceResolver,resultType,null);
		return __parseXpathRes(rawXPathResult,resultType);
	}
	function nameSpaceResolver(nsPrefix){
		const ns = {
			'svg' : 'http://www.w3.org/2000/svg',
			'xlink': 'https://www.w3.org/1999/xlink'
		};
		return ns[nsPrefix];
	}
	function __parseXpathRes(rawXPathResult,resType) {
		switch (rawXPathResult.resultType){
			case XPathResult.NUMBER_TYPE: return rawXPathResult.numberValue;
			case XPathResult.STRING_TYPE: return rawXPathResult.stringValue;
			case XPathResult.BOOLEAN_TYPE: return rawXPathResult.booleanValue;
			case XPathResult.FIRST_ORDERED_NODE_TYPE: return rawXPathResult.singleNodeValue;
		}

		const res = __iterator2array(rawXPathResult);
		if (res.length === 1) {
			if (res[0].nodeType === Node.TEXT_NODE) return res[0].textContent;
			if(resType === XPathResult.ANY_TYPE) return res[0];
		}
		return res;
	}
	function __iterator2array(iterable) {
		const res = [];
		let item = iterable.iterateNext();
		while (item){
			res.push(item);
			item = iterable.iterateNext();
		}
		return res;
	}
	return {json2dom,dom2json,xpath};
});
