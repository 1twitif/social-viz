define(['./form', './smartEvents'], (app, ev) => {
	function changeInputValue(inputNode, value) {
		inputNode.value = value;
		inputNode.dispatchEvent(new Event('change', {target: inputNode, bubbles: true}));
	}

	describe('selection de formulaire', () => {
		let form, anchor;
		beforeEach(() => {
			form = new app.Form();
			anchor = document.createElement('div');
			form.displayInNode(anchor);
		});
		it("Affiche les formulaires disponnibles", () => {
			form.setTemplate({"plop": [], "plip": []});
			expect(anchor.innerHTML).toMatch('plop');
			expect(anchor.innerHTML).toMatch('plip');
		});
		it("N'affiche pas enum comme un formulaire", () => {
			form.setTemplate({"plop": [], "enum": []});
			expect(anchor.innerHTML).toMatch('plop');
			expect(anchor.innerHTML).not.toMatch('enum');
		});
		it("Charge le formulaire au click sur le bouton correspondant", () => {
			form.setTemplate({"plop": ['myInput'], "plip": []});

			expect(anchor.innerHTML).toMatch('plop');
			expect(anchor.innerHTML).not.toMatch('myInput');

			const eventSpy = new Spy();
			ev.on('form.updated', () => {
				if (anchor.querySelector('input[name="myInput"]')) eventSpy();
			});
			ev.clickOn(anchor.querySelector('button'));
			expect(eventSpy).toHaveBeenCalled();
		});
		it("Affiche directement le formulaire adequat si la config le demande", () => {
			form.setTemplate({"myForm": ['myInput']});
			form.setConfig({'selected': 'myForm-new'});
			expect(anchor.querySelector('input[name="myInput"]')).toBeTruthy();
		});
	});
	describe('formulaire', () => {
		let form, anchor;
		beforeEach(() => {
			form = new app.Form();
			form.setConfig({'selected': 'myForm-new'});
			anchor = document.createElement('div');
			form.displayInNode(anchor);
		});
		describe('affichage', () => {
			it("Affiche un input date", () => {
				form.setTemplate({"myForm": [{'myInput': {dataType: 'date'}}]});
				expect(anchor.querySelector('input[type="date"][name="myInput"]')).toBeTruthy();
			});
			it("Affiche une textarea markdown", () => {
				form.setTemplate({"myForm": [{'myInput': {dataType: 'markdown'}}]});
				expect(anchor.querySelector('textarea[name="myInput"]')).toBeTruthy();
			});
			it("gère les champs requis", () => {
				form.setTemplate({"myForm": [{'myInput': {'required': true}}]});
				expect(anchor.querySelector('input[name="myInput"][required]')).toBeTruthy();
			});
			it("gère les listes statiques", () => {
				form.setTemplate({
					"myForm": [
						{'myInput': {'from': 'enum.list'}}
					],
					"enum": {'list': ['one', 'two', 'tree']}
				});
				expect(anchor.querySelector('input[name="myInput"][list*="enum"]')).toBeTruthy();
				expect(document.querySelector('datalist option').value).toBe('one');
			});
			it("gère les listes dynamique", () => {
				form.setTemplate({
					"myForm": [
						'myInput',
						{'parent': {'from': 'myForm'}}
					]
				});
				form.setData({
					'myForm': [
						{'id': 'myForm-plop-2546', 'myInput': 'plop', 'label': 'Plop', 'parent': ''}
					]
				});
				expect(document.getElementById('dataList-myForm').innerHTML).toMatch('Plop');
			});
			it("genère un id dès qu'un champ après le label est modifié", () => {
				form.setTemplate({"myForm": ['before', 'label', 'after']});
				const eventSpy = new Spy();
				anchor.addEventListener('change', () => {
					if (anchor.querySelector('input[name="id"][value^="myForm-safe-Label-"]'))
						eventSpy();
				});
				changeInputValue(anchor.querySelector('input[name="before"]'), 'beOsef');
				changeInputValue(anchor.querySelector('input[name="label"]'), '!safe Labél');
				expect(eventSpy).not.toHaveBeenCalled();
				changeInputValue(anchor.querySelector('input[name="after"]'), 'aftosef');
				expect(eventSpy).toHaveBeenCalled();
			});
			it("charge les données existante quand il y en a", () => {
				const id = 'myForm-dummy';
				form.setTemplate({"myForm": ['before', 'label', 'after']});
				form.setData({'myForm': [{'id': id, 'before': 'someContent'}]});
				form.edit(id);
				expect(anchor.querySelector('input[name="before"]').value).toEqual('someContent');
			});
		});
		describe('affichage / saisie -> données exportable et affichable', () => {
			it("sauvegarde les données saisies dès qu'un id est défini", () => {
				form.setTemplate({"myForm": ['before', 'label', 'after']});
				const data = {'myForm': []};
				form.setData(data);

				changeInputValue(anchor.querySelector('input[name="before"]'), 'not Yet');
				changeInputValue(anchor.querySelector('input[name="label"]'), '!safe Labél');
				expect(data).toEqual({'myForm': []});
				changeInputValue(anchor.querySelector('input[name="after"]'), 'Yet !');
				expect(JSON.stringify(data)).toMatch('{"myForm":\\\[{"id":"myForm-safe-Label-');
				expect(JSON.stringify(data)).toMatch('"before":"not Yet","label":"!safe Labél","after":"Yet !"}]}');
			});
		});
	});
});
