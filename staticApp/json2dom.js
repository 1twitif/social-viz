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
	return {json2dom,dom2json};
});
