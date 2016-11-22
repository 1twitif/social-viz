define(['./form', './smartEvents'], (app,ev) => {
	describe('formulaire', () => {
		describe('json -> objet formulaire', () => {
			it("Construit un formulaire vide", () => {
				const form = new app.Form();
				expect(form instanceof app.Form).toBeTruthy();
			});
		});
		describe('objet formulaire -> affichage', () => {
			it("Affiche les formulaires disponnibles", () => {
				const form = new app.Form({"plop":[],"plip":[]});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.innerHTML).toMatch('plop');
				expect(anchor.innerHTML).toMatch('plip');
			});
			it("N'affiche pas enum comme un formulaire", () => {
				const form = new app.Form({"plop":[],"enum":[]});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.innerHTML).toMatch('plop');
				expect(anchor.innerHTML).not.toMatch('enum');
			});
			it("Affiche un input text", () => {
				const form = new app.Form({"myForm":['myInput']});
				form.setConfig({form:{entryDefault:{dataType:'text'}}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				const eventSpy = new Spy();
				ev.on('form.updated', ()=>{
					if(anchor.querySelector('input[type="text"][name="myInput"]'))
						eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));

				expect(eventSpy).toHaveBeenCalled();
			});
			it("Affiche un input date", () => {
				const form = new app.Form({"myForm":[{'myInput':{dataType:'date'}}]});
				form.setConfig({form:{entryDefault:{dataType:'text'}}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				const eventSpy = new Spy();
				ev.on('form.updated', ()=>{
					if(anchor.querySelector('input[type="date"][name="myInput"]'))
						eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));

				expect(eventSpy).toHaveBeenCalled();
			});
			it("Affiche une textarea markdown", () => {
				const form = new app.Form({"myForm":[{'myInput':{dataType:'markdown'}}]});
				form.setConfig({form:{entryDefault:{dataType:'text'}}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				const eventSpy = new Spy();
				ev.on('form.updated', ()=>{
					if(anchor.querySelector('textarea[name="myInput"]'))
						eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));

				expect(eventSpy).toHaveBeenCalled();
			});
			it("gère les champs requis", () => {
				const form = new app.Form({"myForm":[
					{'myInput':{'required':true}}
				]});
				form.setConfig({form:{entryDefault:{dataType:'text'}}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				const eventSpy = new Spy();
				ev.on('form.updated', ()=>{
					if(anchor.querySelector('input[name="myInput"][required]'))
						eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));

				expect(eventSpy).toHaveBeenCalled();
			});
			it("gère les listes statiques", () => {
				const form = new app.Form({
					"myForm":[
						{'myInput':{'from':'enum.list'}}
						],
					"enum":{'list':['one','two','tree']}
				});
				form.setConfig({form:{entryDefault:{dataType:'text'}}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				const eventSpy = new Spy();
				ev.on('form.updated', ()=>{
					if(anchor.querySelector('input[name="myInput"][list="enumlist"]')
						&& anchor.querySelector('datalist#enumlist option'))
						eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));

				expect(eventSpy).toHaveBeenCalled();
			});
		});
		describe('affichage / saisie -> données exportable et affichable', () => {
			it('test nothing', () => {
				expect(1).toBe(1);
			});
		});
	});
});
