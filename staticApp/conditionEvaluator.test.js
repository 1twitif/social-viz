define(['./conditionEvaluator'], (app) => {
	describe('conditionEvaluator', () => {
		describe('opérandes', () => {
			it("=", () => {
				expect(app.evaluate("1 = 1")).toBe(true);
				expect(app.evaluate("1 = 0")).toBe(false);
				expect(app.evaluate("bob = bob")).toBe(true);
				expect(app.evaluate("bob = notBob")).toBe(false);
			});
			it("!=", () => {
				expect(app.evaluate("1 != 0")).toBe(true);
				expect(app.evaluate("1 != 1")).toBe(false);
			});
			it("*=", () => {
				expect(app.evaluate("marjorie *= jo")).toBe(true);
				expect(app.evaluate("marjorie *= ja")).toBe(false);
			});
			it("^=", () => {
				expect(app.evaluate("john ^= jo")).toBe(true);
				expect(app.evaluate("marjorie ^= jo")).toBe(false);
			});
			it("$=", () => {
				expect(app.evaluate("barjo $= jo")).toBe(true);
				expect(app.evaluate("marjorie $= jo")).toBe(false);
			});
			it("<", () => {
				expect(app.evaluate("9 < 11")).toBe(true);
				expect(app.evaluate("9 < 9")).toBe(false);
				expect(app.evaluate("101 < 11")).toBe(false);
			});
			it("<=", () => {
				expect(app.evaluate("9 <= 11")).toBe(true);
				expect(app.evaluate("9 <= 9")).toBe(true);
				expect(app.evaluate("101 <= 11")).toBe(false);
			});
			it(">", () => {
				expect(app.evaluate("11 > 9")).toBe(true);
				expect(app.evaluate("9 > 9")).toBe(false);
				expect(app.evaluate("11 > 101")).toBe(false);
			});
			it(">=", () => {
				expect(app.evaluate("11 >= 9")).toBe(true);
				expect(app.evaluate("9 >= 9")).toBe(true);
				expect(app.evaluate("11 >= 101")).toBe(false);
			});
		});
		describe("comparaison dynamique", () => {
			it(">=", () => {
				expect(app.evaluate("stock > 1",{"stock":2})).toBe(true);
				expect(app.evaluate("stock > 1",{"stock":1})).toBe(false);
			});
			it("gèrer les conditions faisant référence à d'autres entitées", () => {
				const dataBase = {
					'node': [
						{'id': 'node-1', 'type': 'lambda'},
						{'id': 'node-2', 'type': 'not-lambda'}
					]
				};
				expect(app.evaluate("source.type = lambda",{"source":"node-1"},dataBase)).toBe(true);
				expect(app.evaluate("source.type = lambda",{"source":"node-2"},dataBase)).toBe(false);
			});
			it("gèrer les conditions faisant référence à d'autres entitées en cascade", () => {
				const dataBase = {
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
				};
				expect(app.evaluate("citizen.state.latitude > 20",{"citizen":""},dataBase)).toBe(false);
				expect(app.evaluate("citizen.state.latitude > 20",{"citizen":"citizen-1"},dataBase)).toBe(false);
				expect(app.evaluate("citizen.state.latitude > 20",{"citizen":"citizen-2"},dataBase)).toBe(false);
				expect(app.evaluate("citizen.state.latitude > 20",{"citizen":"citizen-3"},dataBase)).toBe(false);
				expect(app.evaluate("citizen.state.latitude > 20",{"citizen":"citizen-4"},dataBase)).toBe(true);
				expect(app.evaluate("citizen.state.latitude > 20",{"citizen":"citizen-5"},dataBase)).toBe(false);
			});
		});
	});
});

