// mocks
define( 'mock/tradRenderer', ()=>{ return { t: (translateMe)=>translateMe+'-TRAD-OK' }; } );
require.config({ map: { "staticApp/htmlBuilder": { "staticApp/tradRenderer":"mock/tradRenderer" } } });
// test
define(['./htmlBuilder'], (app) => {
	describe('htmlBuilder', () => {
		describe('buildNode', () => {
			it('build usual node', () => {
				const node = app.buildNode('p','Lorem ipsum');
				expect(node.tagName.toLowerCase()).toBe('p');
				expect(node.innerText).toBe('Lorem ipsum-TRAD-OK');
			});
			it('build usual node with no content', () => {
				const node = app.buildNode('div');
				expect(node.tagName.toLowerCase()).toBe('div');
				expect(node.innerText).toBe('');
			});
			it('build input node', () => {
				const node = app.buildNode('input','Lorem ipsum');
				expect(node.tagName.toLowerCase()).toBe('input');
				expect(node.value).toBe('Lorem ipsum');
			});
			it('build textArea node', () => {
				const node = app.buildNode('textarea','Lorem ipsum');
				expect(node.tagName.toLowerCase()).toBe('textarea');
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
				id = "myId";
				me = app.buildNode('div');
				me.id = id;
				here = document.createElement('section');
			});
			it('addOrReplace', () => {
				expect(here.querySelector("div#"+id)).toBeFalsy();
				app.addOrReplace(me, here);
				expect(here.querySelector("div#"+id)).toBeTruthy();
				me = app.buildNode('span');
				me.id = id;
				app.addOrReplace(me, here);
				expect(here.querySelector("div#"+id)).toBeFalsy();
				expect(here.querySelector("span#"+id)).toBeTruthy();
			});
			it('addOnce', () => {
				expect(here.querySelector("div#"+id)).toBeFalsy();
				app.addOnce(me, here);
				expect(here.querySelector("div#"+id)).toBeTruthy();
				me = app.buildNode('span');
				me.id = id;
				app.addOnce(me, here);
				expect(here.querySelector("div#"+id)).toBeTruthy();
				expect(here.querySelector("span#"+id)).toBeFalsy();
			});
		});
	});
});
