// mocks
define( 'mock/tradRenderer', ()=>{ return { t: (translateMe)=>translateMe+'-TRAD-OK' }; } );
require.config({ map: { "staticApp/htmlTools": { "staticApp/trad/tradRenderer":"mock/tradRenderer" } } });
// test
define(['./htmlTools'], (app) => {
	describe('htmlTools', () => {
		describe('buildNode', () => {
			it('build node of asked type', () => {
				const node = app.buildNode('p');
				expect(node.tagName.toLowerCase()).toBe('p');
			});
			it('build usual node with translated content', () => {
				const node = app.buildNode('p','Lorem ipsum');
				expect(node.innerText).toBe('Lorem ipsum-TRAD-OK');
			});
			it('build usual node with no content (so no dumb empty translation)', () => {
				const node = app.buildNode('div');
				expect(node.innerText).toBe('');
			});
			it("build input node and don't translate data", () => {
				const node = app.buildNode('input','Lorem ipsum');
				expect(node.value).toBe('Lorem ipsum');
			});
			it("build textArea node and don't translate data", () => {
				const node = app.buildNode('textarea','Lorem ipsum');
				expect(node.innerText).toBe('Lorem ipsum');
			});
		});
		describe('buildLangPicker', () => {
			it('construit le sélecteur de langue', () => {
				const langPicker = app.buildLangPicker(['en','fr']);
				expect(langPicker.querySelector('[name="lang"][value="en"]')).toBeTruthy();
				expect(langPicker.querySelector('[name="lang"][value="fr"]')).toBeTruthy();
			});
			it('le sélecteur de langue inclue les langues traduites', () => {
				const langPicker = app.buildLangPicker(['en','fr']);
				expect(langPicker.innerHTML).toMatch('lang-en-TRAD-OK');
				expect(langPicker.innerHTML).toMatch('lang-fr-TRAD-OK');
			});
			it('construit le sélecteur de langue avec une langue active', () => {
				const langPicker = app.buildLangPicker(['en','fr','ca'], 'fr');
				expect(langPicker.lang.value).toBe('fr');
			});
		});
		describe('addNodeTo variations', () => {
			let id, me, here;
			beforeEach(() => {
				here = document.createElement('section');
				id = "myId";
				me = app.buildNode('div');
				me.id = id;
			});
			describe("add new node", () =>{
				it('with addOrReplace', () => {
					expect(here.querySelector("div#"+id)).toBeFalsy();
					app.addOrReplace(me, here);
					expect(here.querySelector("div#"+id)).toBeTruthy();
				});
				it('with addOnce', () => {
					expect(here.querySelector("div#"+id)).toBeFalsy();
					app.addOnce(me, here);
					expect(here.querySelector("div#"+id)).toBeTruthy();
				});
			});
			describe("interact with allready taken id", () =>{
				beforeEach(() => {
					app.addOnce(me, here);
					me = app.buildNode('span');
					me.id = id;
				});
				it("don't replace existing node when use addOnce", () => {
					app.addOnce(me, here);
					expect(here.querySelector("div#"+id)).toBeTruthy();
					expect(here.querySelector("span#"+id)).toBeFalsy();
				});
				it("replace existing node when use addOrReplace", () => {
					app.addOrReplace(me, here);
					expect(here.querySelector("div#"+id)).toBeFalsy();
					expect(here.querySelector("span#"+id)).toBeTruthy();
				});
			});
		describe("applySelectiveClassOnNodes", () =>{
			let nodeSet, condition;
			function setClass(nodeSet,classes){
				nodeSet.forEach((n)=> n.setAttribute("class",classes) );
			}
			beforeEach(() => {
				nodeSet = [
					document.createElement("first"),
					document.createElement("second")
				];
				condition = (n)=> n.localName !== "second";
			});
			it("addClass", () => {
				app.applySelectiveClassOnNodes(nodeSet, "notSecond", condition);
				expect(nodeSet[0].className).toBe("notSecond");
				expect(nodeSet[1].className).toBeFalsy();
			});
			it("no conflit with other classes", () => {
				setClass(nodeSet,"plop");
				app.applySelectiveClassOnNodes(nodeSet, "notSecond", condition);
				expect(nodeSet[0].classList.length).toBe(2);
				expect(nodeSet[1].classList.length).toBe(1);
			});
			it("remove when needed", () => {
				setClass(nodeSet,"plop notSecond");
				app.applySelectiveClassOnNodes(nodeSet, "notSecond", condition);
				expect(nodeSet[0].classList.length).toBe(2);
				expect(nodeSet[1].classList.length).toBe(1);
			});
		});
		});
	});
});
