define(['./structManipulation'], (app) => {
	describe('structManipulation', () => {
		describe('merge', () => {
			it('simple objects', () => {
				expect(app.merge({a: 1, b: 2}, {b: 3, c: 4})).toEqual({a: 1, b: 3, c: 4});
			});
			it('nested objects', () => {
				expect(app.merge([{a: 1, b: 2}], [{b: 3, c: 4}])).toEqual([{a: 1, b: 3, c: 4}]);
			});
			it('correctly overwrite', () => {
				expect(app.merge({a: 1, b: 2}, {b: []})).toEqual({a: 1, b: []});
			});
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
		describe('removeDefault', () => {
			it('simple objects', () => {
				let data = {a: 1, b: 2, c: 4};
				let reference = {b: 2, c: 3};
				let expected = {a: 1, c: 4};
				expect(app.removeDefault(data, reference)).toEqual(expected);
			});
			it('nested objects', () => {
				let data = [{a: 1, b: 2, c: 4}];
				let reference = [{b: 2, c: 3}];
				let expected = [{a: 1, c: 4}];
				expect(app.removeDefault(data, reference)).toEqual(expected);
			});
			it('in more nested objects', () => {
				let data = {a: [{a: 5}, {a: 6}]};
				let reference = {a: [{a: 5}, {a: 6}]};
				let expected = {};
				expect(app.removeDefault(data, reference)).toEqual(expected);
			});
		});
		describe('cleanJson', () => {
			it('emtpy json', () => {
				expect(app.cleanJson(undefined)).toEqual(undefined);
				expect(app.cleanJson([])).toEqual([]);
				expect(app.cleanJson({})).toEqual({});
			});
			it('nested json', () => {
				let data = {a: []};
				let expected = {};
				expect(app.cleanJson(data)).toEqual(expected);
			});
			it('more nested json', () => {
				let data = [{}, {}, {}, {}];
				let expected = [];
				expect(app.cleanJson(data)).toEqual(expected);
			});
			it('0 is not null', () => {
				let data = [0];
				let expected = [0];
				expect(app.cleanJson(data)).toEqual(expected);
			});
			it('false is not null', () => {
				let data = [false];
				let expected = [false];
				expect(app.cleanJson(data)).toEqual(expected);
			});
			it('deep clean', () => {
				let data = [{ref:[]}, {plop:null}, {osef:undefined}, {},false,null,0];
				let expected = [false,0];
				expect(app.cleanJson(data)).toEqual(expected);
			});
		});
		describe('diff', () => {
			it('add', () => {
				let refJson = {a: 1};
				let newJson = {a: 1, b: 2};
				let expected = {b: 2};
				expect(app.diff(refJson, newJson)).toEqual(expected);
			});
			it('change', () => {
				let refJson = {a: 1};
				let newJson = {a: 2};
				let expected = {a: 2};
				expect(app.diff(refJson, newJson)).toEqual(expected);
			});
			it('remove', () => {
				let refJson = {a: 1, b: 2};
				let newJson = {a: 1};
				let expected = {b: null};
				expect(app.diff(refJson, newJson)).toEqual(expected);
			});
			it('remove at array end', () => {
				let refJson = [1,2];
				let newJson = [1];
				let expected = [,null];
				expect(app.diff(refJson, newJson)).toEqual(expected);
			});
			it('nested objects', () => {
				let refJson = [{b: 2, c: 3}];
				let newJson = [{a: 1, b: 2, c: 4}];
				let expected = [{a: 1, c: 4}];
				expect(app.diff(refJson, newJson)).toEqual(expected);
			});
		});
	});
});
