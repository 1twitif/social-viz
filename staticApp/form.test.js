define(['./form', './smartEvents'], (app, ev) => {
	function changeInputValue(inputNode, value) {
		inputNode.value = value;
		inputNode.dispatchEvent(new Event('input', {target: inputNode, bubbles: true}));
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
			anchor = document.body; //.createElement('div');
			form.displayInNode(anchor);
		});
		describe('affichage', () => {
			it("Affiche un input date", () => {
				form.setTemplate({"myForm": [{'myInput': {dataType: 'date'}}]});
				expect(anchor.querySelector('input[type="date"][name="myInput"]')).toBeTruthy();
			});
			it("Affiche une textarea markdown", () => {
				form.setTemplate({"myForm": [{'myInput': {dataType: 'markdown'}}]});
				expect(anchor.getElementsByTagName('textarea').length).toBe(1);
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
			it("n'affiche pas les if comme des input", () => {
				form.setTemplate({
					"myForm": [
						'name',
						{'if': {condition: 'name = bob', then: ['message']}}
					]
				});
				expect(anchor.querySelector('input[name="if"]')).toBeFalsy();
			});
			it("affiche les if quand les conditions sont remplies", () => {
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name = bob', then: ['message']}}]});
				form.setData({'myForm': [{'id': 'myForm-bob', 'name': 'bob'}]});
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				form.edit('myForm-bob');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
			});
			it("gère d'autres opérandes que =", () => {
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name != bob', then: ['message']}}]});
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
				changeInputValue(anchor.querySelector('input[name="name"]'), 'bob');
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name *= jo', then: ['message']}}]});
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				changeInputValue(anchor.querySelector('input[name="name"]'), 'marjorie');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name ^= jo', then: ['message']}}]});
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				changeInputValue(anchor.querySelector('input[name="name"]'), 'john');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name $= jo', then: ['message']}}]});
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				changeInputValue(anchor.querySelector('input[name="name"]'), 'barjo');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
			});
			it("affiche les if quand les conditions sont remplies, y compris if imbriqués.", () => {
				form.setTemplate({
					"myForm": [
						'name',
						'city',
						{
							'if': {
								condition: 'name = bob', then: [
									{
										'if': {
											condition: 'city = bordeaux', then: [
												'message'
											]
										}
									}
								]
							}
						}
					]
				});
				form.setData({'myForm': [{'id': 'myForm-bob', 'name': 'bob', 'city': 'bordeaux'}]});
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				form.edit('myForm-bob');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
			});
			it("affiche les if après un changement remplissant ses conditions", () => {
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name = bob', then: ['message']}}]});
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
				changeInputValue(anchor.querySelector('input[name="name"]'), 'bob');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy(); // safer with input spy
			});
			it("masque les if dont les conditions ne sont plus remplies", () => {
				form.setTemplate({"myForm": ['name', {'if': {condition: 'name = bob', then: ['message']}}]});
				changeInputValue(anchor.querySelector('input[name="name"]'), 'bob');
				expect(anchor.querySelector('input[name="message"]')).toBeTruthy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="name"]'), 'alice');
				expect(anchor.querySelector('input[name="message"]')).toBeFalsy(); // safer with input spy
			});
			it("gèrer les conditions faisant référence à d'autres entitées", () => {
				form.setTemplate({
					"link": [
						{'source': {'from': 'node'}},
						{'if': {condition: 'source.type = lambda', then: ['lambdaQualification']}}
					],
					"node": ['type']
				});
				form.setData({
					'node': [
						{'id': 'node-1', 'type': 'lambda'},
						{'id': 'node-2', 'type': 'not-lambda'}
					]
				});
				form.edit('link-new');
				expect(anchor.querySelector('input[name="lambdaQualification"]')).toBeFalsy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="source"]'), 'node-1');
				expect(anchor.querySelector('input[name="lambdaQualification"]')).toBeTruthy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="source"]'), 'node-2');
				expect(anchor.querySelector('input[name="lambdaQualification"]')).toBeFalsy(); // safer with input spy
			});
			it("gèrer les conditions faisant référence à d'autres entitées en cascade", () => {
				form.setTemplate({
					"link": [
						{'citizen': {'from': 'citizen'}},
						{'if': {condition: 'citizen.state.latitude > 20', then: ['temperature']}}
					],
					"citizen": [{'state':{'from':'state'}}],
					"state": ['latitude']
				});
				form.setData({
					'citizen': [
						{'id': 'citizen-1', 'state': ''},
						{'id': 'citizen-2', 'state': 'state-42'},
						{'id': 'citizen-3', 'state': 'state-3'},
						{'id': 'citizen-4', 'state': 'state-4'},
						{'id': 'citizen-5', 'state': 'state-5'}
					],
					"state": [
						{'id': 'state-3'},
						{'id': 'state-4', 'latitude': 22},
						{'id': 'state-5', 'latitude': 5}
					]
				});
				form.edit('link-new');
				expect(anchor.querySelector('input[name="temperature"]')).toBeFalsy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="citizen"]'), 'citizen-1');
				expect(anchor.querySelector('input[name="temperature"]')).toBeFalsy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="citizen"]'), 'citizen-2');
				expect(anchor.querySelector('input[name="temperature"]')).toBeFalsy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="citizen"]'), 'citizen-3');
				expect(anchor.querySelector('input[name="temperature"]')).toBeFalsy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="citizen"]'), 'citizen-4');
				expect(anchor.querySelector('input[name="temperature"]')).toBeTruthy(); // safer with input spy
				changeInputValue(anchor.querySelector('input[name="citizen"]'), 'citizen-5');
				expect(anchor.querySelector('input[name="temperature"]')).toBeFalsy(); // safer with input spy
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
