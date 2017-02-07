define(['./json2dom'], (app) => {
	describe('json2dom', () => {
		it('convert json to dom', () => {
			const jsonObj = {clef:'valeur',clef2:['tableau',['de'],{valeurs:false}]};
			const domObj = app.json2dom(jsonObj);
			expect(domObj.getElementsByTagName('valeurs')[0].innerText).toEqual('false');
		});
		it('convert back generated dom to json', () => {
			const jsonObj = {clef:'valeur',clef2:['tableau',['de'],{valeurs:false}]};
			const identic = app.dom2json(app.json2dom(jsonObj));
			expect(identic).toEqual(jsonObj);
		});
	});
});
