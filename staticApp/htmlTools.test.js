// mocks
define('mock/tradRenderer', () => {
	return {t: (translateMe) => translateMe + '-TRAD-OK'};
});
require.config({map: {"staticApp/htmlTools": {"staticApp/trad/tradRenderer": "mock/tradRenderer"}}});
// test
define(['./htmlTools'], (app) => {
	describe('htmlTools', () => {
		describe('buildNode', () => {
			function template(tag, expectedVal, checkWhere, setContent = false) {
				const node = setContent ? app.buildNode(tag, 'Lorem ipsum') : app.buildNode(tag);
				expect(node[checkWhere]).toBe(expectedVal);
			}

			it('build node of asked type', () => template('p', 'p', 'localName'));
			it('no content, no dumb empty translation', () => template('div', '', 'innerText'));
			it('build usual node with translated content', () => template('p', 'Lorem ipsum-TRAD-OK', 'innerText', true));
			it("build input node and don't translate data", () => template('input', 'Lorem ipsum', 'value', true));
			it("build textArea node and don't translate data", () => template('textarea', 'Lorem ipsum', 'innerText', true));
		});
		describe('buildLangPicker', () => {
			it('construit le sélecteur de langue', () => {
				const langPicker = app.buildLangPicker(['en', 'fr']);
				expect(langPicker.querySelector('[name="lang"][value="en"]')).toBeTruthy();
				expect(langPicker.querySelector('[name="lang"][value="fr"]')).toBeTruthy();
			});
			it('le sélecteur de langue inclue les langues traduites', () => {
				const langPicker = app.buildLangPicker(['en', 'fr']);
				expect(langPicker.innerHTML).toMatch('lang-en-TRAD-OK');
				expect(langPicker.innerHTML).toMatch('lang-fr-TRAD-OK');
			});
			it('construit le sélecteur de langue avec une langue active', () => {
				const langPicker = app.buildLangPicker(['en', 'fr', 'ca'], 'fr');
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
			describe("add new node", () => {
				function template(func) {
					expect(here.querySelector("div#" + id)).toBeFalsy();
					func(me, here);
					expect(here.querySelector("div#" + id)).toBeTruthy();
				}

				it('with addOrReplace', () => template(app.addOrReplace));
				it('with addOnce', () => template(app.addOnce));
			});
			describe("interact with allready taken id", () => {
				beforeEach(() => {
					app.addOnce(me, here);
					me = app.buildNode('span');
					me.id = id;
				});
				function template(func, tagTrue, tagFalse) {
					func(me, here);
					expect(here.querySelector(tagTrue + "#" + id)).toBeTruthy();
					expect(here.querySelector(tagFalse + "#" + id)).toBeFalsy();
				}

				it("don't replace existing node when use addOnce", () => template(app.addOnce, "div", "span"));
				it("replace existing node when use addOrReplace", () => template(app.addOrReplace, "span", "div"));
			});
		});
		describe("applySelectiveClassOnNodes", () => {
			let nodeSet, condition;
			beforeEach(() => {
				nodeSet = [
					document.createElement("first"),
					document.createElement("second")
				];
				condition = (n) => n.localName !== "second";
			});
			function expectTemplate(result1, result2) {
				app.applySelectiveClassOnNodes(nodeSet, "notSecond", condition);
				expect(nodeSet[0].className).toEqual(result1);
				expect(nodeSet[1].className).toEqual(result2);
			}

			function initClass(classes) {
				nodeSet.forEach((n) => n.setAttribute("class", classes));
			}

			it("addClass", () => {
				expectTemplate("notSecond", "");
			});
			it("no conflit with other classes", () => {
				initClass("plop");
				expectTemplate("plop notSecond", "plop");
			});
			it("remove when needed", () => {
				initClass("plop notSecond");
				expectTemplate("plop notSecond", "plop");
			});
		});
	});
});
