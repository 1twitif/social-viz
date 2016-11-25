define(['./form', './smartEvents'], (app,ev) => {
	function changeInputValue(inputNode,value){
		inputNode.value = value;
		inputNode.dispatchEvent(new Event('change',{target:inputNode,bubbles:true}));
	}
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
			it("Charge le formulaire au click sur le bouton correspondant", () => {
				const form = new app.Form({"plop":['myInput'],"plip":[]});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				expect(anchor.innerHTML).toMatch('plop');
				expect(anchor.innerHTML).not.toMatch('myInput');

				const eventSpy = new Spy();
				ev.on('form.updated', ()=>{
					if(anchor.querySelector('input[name="myInput"]')) eventSpy();
				});
				ev.clickOn(anchor.querySelector('button'));
				expect(eventSpy).toHaveBeenCalled();
			});
			it("Affiche directement le formulaire adequat si la config le demande", () => {
				const form = new app.Form({"myForm":['myInput']});
				form.setConfig({'selected':'myForm-new'});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.querySelector('input[name="myInput"]')).toBeTruthy();
			});
			it("Affiche un input date", () => {
				const form = new app.Form({"myForm":[{'myInput':{dataType:'date'}}]});
				form.setConfig({'selected':'myForm-new'});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.querySelector('input[type="date"][name="myInput"]')).toBeTruthy();
			});
			it("Affiche une textarea markdown", () => {
				const form = new app.Form({"myForm":[{'myInput':{dataType:'markdown'}}]});
				form.setConfig({'selected':'myForm-new'});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.querySelector('textarea[name="myInput"]')).toBeTruthy();
			});
			it("gère les champs requis", () => {
				const form = new app.Form({"myForm":[ {'myInput':{'required':true}} ]});
				form.setConfig({'selected':'myForm-new'});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);
				expect(anchor.querySelector('input[name="myInput"][required]')).toBeTruthy();
			});
			it("gère les listes statiques", () => {
				const form = new app.Form({
					"myForm":[
						{'myInput':{'from':'enum.list'}}
					],
					"enum":{'list':['one','two','tree']}
				});
				form.setConfig({'selected':'myForm-new'});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				expect(anchor.querySelector('input[name="myInput"][list*="enum"]')).toBeTruthy();
				expect(document.querySelector('datalist option').value).toBe('one');
			});
			it("gère les listes dynamique", () => {
				const form = new app.Form({
					"myForm":[
						'myInput',
						{'parent':{'from':'myForm'}}
					]
				});
				form.setConfig({'selected':'myForm-new'});
				form.setData({myForm:[
					{id:'myForm-plop-2546',myInput:'plop',label:'Plop',parent:''}
				]});
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				expect(document.getElementById('dataList-myForm').innerHTML).toMatch('Plop');
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
				changeInputValue(anchor.querySelector('input[name="before"]'),'osef');
				changeInputValue(anchor.querySelector('input[name="label"]'),'!safe Labél');
				expect(eventSpy).not.toHaveBeenCalled();
				changeInputValue(anchor.querySelector('input[name="after"]'),'osef');
				expect(eventSpy).toHaveBeenCalled();
			});
		});
		it("charge les données existante quand il y en a", () => {
			const id = 'myForm-dummy';
			const form = new app.Form({"myForm":['before','label','after']});
			const data = {'myForm':[{'id':id,'before':'someContent'}]};
			form.setData(data);
			form.setConfig({'selected':id});
			form.edit(id);
			const anchor = document.createElement('div');
			form.displayInNode(anchor);

			expect(anchor.querySelector('input[name="before"]').value).toEqual('someContent');
		});
		describe('affichage / saisie -> données exportable et affichable', () => {
			it("sauvegarde les données saisies dès qu'un id est défini", () => {
				const form = new app.Form({"myForm":['before','label','after']});
				form.setConfig({'selected':'myForm-new'});
				const data = {'myForm':[]};
				form.setData(data);
				form.edit('myForm-new');
				const anchor = document.createElement('div');
				form.displayInNode(anchor);

				changeInputValue(anchor.querySelector('input[name="before"]'),'not Yet');
				changeInputValue(anchor.querySelector('input[name="label"]'),'!safe Labél');
				expect(data).toEqual({'myForm':[]});
				changeInputValue(anchor.querySelector('input[name="after"]'),'Yet !');
				expect(JSON.stringify(data)).toMatch('{"myForm":\\\[{"id":"myForm-safe-Label-');
				expect(JSON.stringify(data)).toMatch('"before":"not Yet","label":"!safe Labél","after":"Yet !"}]}');
			});
		});
	});
});
