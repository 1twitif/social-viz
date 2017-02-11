define(['./json2dom'], (app) => {
	describe('json2dom', () => {
		it('convert json to dom', () => {
			const jsonObj = {clef:'valeur',clef2:['tableau',['de'],{valeurs:false}]};
			const domObj = app.json2dom(jsonObj);
			expect(domObj.getElementsByTagName('valeurs')[0].innerText).toEqual('false');
		});
		it('convert back generated dom to json', () => {
			const jsonObj = {clef:'valeur',clef2:['tableau',['de'],{valeurs:false,or:true,numeric:0}]};
			const identic = app.dom2json(app.json2dom(jsonObj));
			expect(identic).toEqual(jsonObj);
		});
		it('converted dom have id and class', () => {
			const domObj = app.json2dom({node:{id:"plop","class":"plic ploc"}});
			expect(domObj.querySelector('#plop')).toBeTruthy();
			expect(domObj.querySelectorAll('.ploc')[0]).toBeTruthy();
		});
		it('converted dom are Xpath compatible', () => {
			const domObj = app.json2dom({
				node:[
					{id:"plop","class":"plic ploc"},
					{id:"truc", option:"premium"},
					{id:"bidule"}
					],
				link:[
					{source:"plop",target:"truc"}
				]
			});
			expect(document.evaluate('//link/*[target = //node/*[option="premium"]/id ]/source',domObj,null,XPathResult.STRING_TYPE, null).stringValue).toBe("plop");
		});
		it('query with smart result', () => {
			const domObj = app.json2dom([1,3,"text",{a:"b"}]);

			expect(app.xpath("count(//*)",domObj)).toBe(5);
			expect(app.xpath("/*[3]/text()",domObj)).toBe("text");
			expect(app.xpath("/*[3]",domObj,XPathResult.STRING_TYPE)).toBe("text");
			expect(app.xpath("/*[2] = 3",domObj)).toBe(true);
			expect(app.xpath("..",app.xpath("//a",domObj))).toBe(app.xpath("/*[4]",domObj));
			expect(app.xpath("//a",domObj,XPathResult.UNORDERED_NODE_ITERATOR_TYPE)[0]).toBe(app.xpath("//a",domObj));
			expect(app.xpath("//a",domObj,XPathResult.FIRST_ORDERED_NODE_TYPE)).toBe(app.xpath("//a",domObj));
		});
		it('query in hybrid html/svg dom', () => {
			document.body.appendChild(document.createElement("svg"));
			document.body.appendChild(document.createElement("unknown-namespace:plop"));
			expect(app.xpath("//svg:svg",document.body)).toBeTruthy();
		});
	});
});
