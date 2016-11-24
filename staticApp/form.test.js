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
				form.setConfig({'form':{}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.innerHTML).toMatch('plop');
				expect(anchor.innerHTML).toMatch('plip');
			});
			it("N'affiche pas enum comme un formulaire", () => {
				const form = new app.Form({"plop":[],"enum":[]});
				form.setConfig({'form':{}});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.innerHTML).toMatch('plop');
				expect(anchor.innerHTML).not.toMatch('enum');
			});
			it("Affiche directement le formulaire adequat si la config le demande", () => {
				const form = new app.Form({"myForm":['myInput']});
				form.setConfig({
					'form':{'entryDefault':{'dataType':'text'}},
					'selected':'myForm-new',
					'userMode':'edit'
				});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.innerHTML).toMatch('myInput');
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
					if(anchor.querySelector('input[name="myInput"][list*="enum"]')
						&& anchor.querySelector('datalist option'))
						eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));

				expect(eventSpy).toHaveBeenCalled();
			});
			it("gère les listes dynamique", () => {
				const form = new app.Form({
					"myForm":[
						'myInput',
						{'parent':{'from':'myForm'}}
					]
				});
				form.setConfig({
					'form':{'entryDefault':{'dataType':'text'}},
					'selected':'myForm-new'
				});
				form.setData({myForm:[
					{id:'myForm-plop-2546',myInput:'plop',label:'Plop',parent:''}
				]});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				expect(anchor.innerHTML).toMatch('Plop');
			});
			it("genère un id dès qu'un champ après le label est modifié", () => {
				const form = new app.Form({
					"myForm":['before','label','after']});
				form.setConfig({
					'form':{'entryDefault':{'dataType':'text'}},
					'selected':'myForm-new'
				});
				form.edit('myForm-new');
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				const eventSpy = new Spy();
				anchor.addEventListener('change', ()=>{
					if(anchor.querySelector('input[name="id"][value^="myForm-safe-Label-"]'))
						eventSpy();
				});
				function changeInputValue(inputNode,value){
					inputNode.setAttribute('value',value);
					inputNode.dispatchEvent(new Event('change',{target:inputNode,bubbles:true}));
				}
				changeInputValue(anchor.querySelector('input[name="before"]'),'osef');
				changeInputValue(anchor.querySelector('input[name="label"]'),'!safe Labél');
				expect(eventSpy).not.toHaveBeenCalled();
				changeInputValue(anchor.querySelector('input[name="after"]'),'osef');
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
