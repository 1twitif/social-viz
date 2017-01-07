define(['./structManipulation'], (app) => {
	describe('structManipulation', () => {
		it('merge simple objects', () => {
			expect(app.merge({a: 1, b: 2}, {b: 3, c: 4})).toEqual({a: 1, b: 3, c: 4});
		});
		it('merge nested objects', () => {
			expect(app.merge([{a: 1, b: 2}], [{b: 3, c: 4}])).toEqual([{a: 1, b: 3, c: 4}]);
		});
		it('merge correctly overwrite', () => {
			expect(app.merge({a: 1, b: 2}, {b: []})).toEqual({a: 1, b: []});
		});
		it('merge inOrder', () => {
			const orderedKey = ['bob', 'alice', 'john'];
			const map = {
				'alice': {a: 1, b: 5, z: 9},
				'john': {j: 3, z: 7},
				'bob': {b: 2, j: 4, z: 1}
			};
			const expected = {a: 1, b: 5, j: 3, z: 7};
			expect(app.mergeInOrder(orderedKey, map)).toEqual(expected);
		});
		it('removeDefault simple objects', () => {
			let data = {a: 1, b: 2, c: 4};
			let reference = {b: 2, c: 3};
			let expected = {a: 1, c: 4};
			expect(app.removeDefault(data, reference)).toEqual(expected);
		});
		it('removeDefault nested objects', () => {
			let data = [{a: 1, b: 2, c: 4}];
			let reference = [{b: 2, c: 3}];
			let expected = [{a: 1, c: 4}];
			expect(app.removeDefault(data, reference)).toEqual(expected);
		});
		it('removeDefault of more nested objects', () => {
			let data = {a: [{a: 5}, {a: 6}]};
			let reference = {a: [{a: 5}, {a: 6}]};
			let expected = {};
			expect(app.removeDefault(data, reference)).toEqual(expected);
		});
		it('cleanJson on emtpy json', () => {
			expect(app.cleanJson(undefined)).toEqual(undefined);
			expect(app.cleanJson([])).toEqual([]);
			expect(app.cleanJson({})).toEqual({});
		});
		it('cleanJson on nested json', () => {
			let data = {a: []};
			let expected = {};
			expect(app.cleanJson(data)).toEqual(expected);
		});
		it('cleanJson on more nested json', () => {
			let data = [{}, {}, {}, {}];
			let expected = [];
			expect(app.cleanJson(data)).toEqual(expected);
		});
		it('for cleanJson 0 is not null', () => {
			let data = [0];
			let expected = [0];
			expect(app.cleanJson(data)).toEqual(expected);
		});
		it('for cleanJson false is not null', () => {
			let data = [false];
			let expected = [false];
			expect(app.cleanJson(data)).toEqual(expected);
		});
	});
});
