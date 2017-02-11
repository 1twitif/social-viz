define([], () => {
	function json2dom(jsObj, parent) {
		if(typeof parent === 'undefined') parent = document.createElement('root');
		for(let key in jsObj) if(jsObj.hasOwnProperty(key)) {
			const value = jsObj[key];
			let child;
			if (isNaN(key - 0)) child = document.createElement(key);
			else child = document.createElement('array-item');
			if(typeof value === 'object' && value !== null) json2dom(value,child);
			else child.innerHTML = value;
			parent.appendChild(child);
			if(key === "id") parent.id = value;
			if(key === "class") parent.setAttribute("class",value);
		}
		return parent;
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
	function nameSpaceResolver(nsPrefix){
		const ns = {
			'svg' : 'http://www.w3.org/2000/svg',
			'xlink': 'https://www.w3.org/1999/xlink'
		};
		return ns[nsPrefix] || null;
	}
	function xpath(xPathQuery,element, resultType=XPathResult.ANY_TYPE){
		const doc = element.ownerDocument;
		const rawXPathResult = doc.evaluate(xPathQuery,element,nameSpaceResolver,resultType,null);
		switch (rawXPathResult.resultType){
			case XPathResult.NUMBER_TYPE: return rawXPathResult.numberValue;
			case XPathResult.STRING_TYPE: return rawXPathResult.stringValue;
			case XPathResult.BOOLEAN_TYPE: return rawXPathResult.booleanValue;
		}
		const res = [];
		let item = rawXPathResult.iterateNext();
		while (item){
			res.push(item);
			item = rawXPathResult.iterateNext();
		}
		if (res.length === 1) {
			if (res[0].nodeType === Node.TEXT_NODE) return res[0].textContent;
			if(resultType === XPathResult.ANY_TYPE || resultType === XPathResult.FIRST_ORDERED_NODE_TYPE) return res[0];
		}
		return res;
	}
	return {json2dom,dom2json,xpath};
});
