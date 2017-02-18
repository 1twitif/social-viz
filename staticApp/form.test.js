define(['./form', './smartEvents'], (app, ev) => {
	const changeInputValue = ev.changeInputValue;
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
			ev.reset();
			document.body.innerHTML = "";
			form = new app.Form();
			form.setConfig({'selected': 'myForm-new'});
			anchor = document.body; //.createElement('div');
			form.displayInNode(anchor);
		});
		afterEach((done) => {
			ev.reset();
			document.body.innerHTML = "";
			setTimeout(done, 0);
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
			describe("titre/catégories", () => {
				it("convertie la syntaxe simplifié en syntaxe explicite", () => {
					const simple = {"monTitre":["entréeEnfant1","entréeEnfant2"]};
					const explicite = {name:"category",title:"monTitre",content:[{name:"monTitre.entréeEnfant1"},{name:"monTitre.entréeEnfant2"}]};
					const attendu = app.__parseEntry(simple);
					expect(attendu).toEqual(explicite);
				});
				it("n'affiche pas les categories comme des input", () => {
					form.setTemplate({
						"myForm": [
							{'titre': ['enfant']}
						]
					});
					expect(anchor.querySelector('input[name="titre"]')).toBeFalsy();
					expect(anchor.querySelector('input[name="category"]')).toBeFalsy();
				});
				it("affiche le titre sous forme de fieldset", () => {
					form.setTemplate({
						"myForm": [
							{'titre': ['enfant']}
						]
					});
					expect(anchor.querySelector('fieldset[name="titre"]>legend')).toBeTruthy();
				});
				it("préfixe les nom des enfants sans préfixé les noms réservé", () => {
					form.setTemplate({
						"myForm": [
							{'titre': [
								'enfant1',
								{"if":{condition:"1 = 1",then:["jouet"]}},
								{"sous-titre":["enfant2"]},
								{"category":{title:"autre-sous-titre",content:["enfant3"]}}
							]}
						]
					});
					expect(anchor.querySelector('input[name="titre.enfant1"]')).toBeTruthy();
					expect(anchor.querySelector('input[name="titre.jouet"]')).toBeTruthy();
					expect(anchor.querySelector('input[name="titre.sous-titre.enfant2"]')).toBeTruthy();
					expect(anchor.querySelector('input[name="titre.autre-sous-titre.enfant3"]')).toBeTruthy();
				});
			});

			describe("if: fragment de formulaire conditionnels", () => {
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
					form.setTemplate({"myForm": ['name', {'if': {condition: 'name = "bob"', then: ['message']}}]});
					form.setData({'myForm': [{'id': 'myForm-bob', 'name': 'bob'}]});
					expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
					form.edit('myForm-bob');
					expect(anchor.querySelector('input[name="message"]')).toBeTruthy();
				});
				it("masque les if dont les conditions ne sont plus remplies", () => {
					form.setTemplate({"myForm": ['count', {'if': {condition: 'count <= 9', then: ['message']}}]});
					changeInputValue(anchor.querySelector('input[name="count"]'), '5');
					expect(anchor.querySelector('input[name="message"]')).toBeTruthy(); // safer with input spy
					changeInputValue(anchor.querySelector('input[name="count"]'), '11');
					expect(anchor.querySelector('input[name="message"]')).toBeFalsy(); // safer with input spy
				});
				it("affiche les if quand les conditions sont remplies, y compris if imbriqués.", () => {
					form.setTemplate({
						"myForm": [
							'name',
							'city',
							{
								'if': {
									condition: 'name = "bob"', then: [
										{
											'if': {
												condition: 'city = "bordeaux"', then: [
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
					form.setTemplate({"myForm": ['count', {'if': {condition: 'count >= 5', then: ['message']}}]});
					expect(anchor.querySelector('input[name="message"]')).toBeFalsy();
					changeInputValue(anchor.querySelector('input[name="count"]'), '5');
					expect(anchor.querySelector('input[name="message"]')).toBeTruthy(); // safer with input spy
				});
				it("gèrer les conditions faisant référence à d'autres entitées", () => {
					form.setTemplate({
						"link": [
							{'source': {'from': 'node'}},
							//{'if': {condition: 'source.type = lambda', then: ['lambdaQualification']}} TODO: re rendre cette syntaxe utilisable.
							{'if': {condition: "/node/*[id=/activeForm/source and type = 'lambda']", then: ['lambdaQualification']}}

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
			it("genère des id d'une longueur modérée", () => {
				form.setTemplate({"myForm": ['label', 'after']});
				changeInputValue(anchor.querySelector('input[name="label"]'), 'un nom à rallonge, mais vraiment trop long, si si je vous assure !');
				changeInputValue(anchor.querySelector('input[name="after"]'), 'touch');
				expect(anchor.querySelector('input[name="id"]').value).toMatch('myForm-un-nom-a-rallonge-m-');
			});
			it("charge les données existante quand il y en a", () => {
				const id = 'myForm-dummy';
				form.setTemplate({"myForm": ['before', 'label', 'after']});
				form.setData({'myForm': [{'id': id, 'before': 'someContent'}]});
				form.edit(id);
				expect(anchor.querySelector('input[name="before"]').value).toEqual('someContent');
			});

			describe('autoCalc', () => {
				function autoCalcTestTemplate(arrayFieldValue, expectInputName, expectedValue) {
					for (let item of arrayFieldValue) {
						changeInputValue(anchor.querySelector('input[name="' + item[0] + '"]'), item[1]);
					}
					expect(anchor.querySelector('input[name="' + expectInputName + '"]').value).toEqual(expectedValue);
				}

				it("remplie automatiquement les champs en autoCalc", () => {
					form.setTemplate({myForm: ["one", "two", {"myInput": {autoCalc: "concat(one,' ',two)"}}]});
					autoCalcTestTemplate(
						[['one', 'plip'], ['two', 'plop']],
						'myInput', 'plip plop'
					);
				});
				it("remplie automatiquement les champs en autoCalc sans laisser d'espace superflu", () => {
					form.setTemplate({myForm: ["one", "two", {"myInput": {autoCalc: "concat(one,' ',two)"}}]});
					autoCalcTestTemplate(
						[['two', 'plop']],
						'myInput', 'plop'
					);
				});
				it("retiens la valeur modifié par l'utilisateur des champs en autoCalc", () => {
					form.setTemplate({myForm: ["one", {"myInput": {autoCalc: "one"}}]});
					autoCalcTestTemplate(
						[['myInput', 'userInput'], ['one', 'autoInput']],
						'myInput', 'userInput'
					);
				});
				it("si autoOverwriteCustom est défini, les autoCalc écrase la valeur précédent", () => {
					form.setTemplate({myForm: ["one", {"myInput": {autoCalc: "one", autoOverwriteCustom: true}}]});
					autoCalcTestTemplate(
						[['myInput', 'userInput'], ['one', 'autoInput']],
						'myInput', 'autoInput'
					);
				});
				it("autoCalc avec calcul", () => {
					form.setTemplate({myForm: ["one", {"myInput": {autoCalc: "one * 2"}}]});
					autoCalcTestTemplate(
						[['one', 3]],
						'myInput', '6'
					);
				});
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
			// mise à jour
			// suppression
			// export
			// hors test : persistance localstorage
		});
	});
});
