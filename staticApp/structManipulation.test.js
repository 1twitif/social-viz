const app = require('./structManipulation');
test('merge simple objects', () => {
	expect(app.merge({a: 1, b: 2}, {b: 3, c: 4})).toEqual({a: 1, b: 3, c: 4});
});
test('merge nested objects', () => {
	expect(app.merge([{a: 1, b: 2}], [{b: 3, c: 4}])).toEqual([{a: 1, b: 3, c: 4}]);
});
test('merge inOrder', () => {
	const orderedKey = ['bob','alice','john'];
	const map = {
		'alice': {a: 1, b:5, z:9},
		'john':{j:3, z:7},
		'bob':{b: 2, j:4, z:1}
	};
	const expected = {a:1,b:5,j:3,z:7};
	expect(app.mergeInOrder(orderedKey,map)).toEqual(expected);
});
test('removeDefault simple objects', () => {
	let data = {a:1,b:2,c:4};
	let reference = {b:2,c:3};
	let expected = {a:1,c:4};
	expect(app.removeDefault(data, reference)).toEqual(expected);
});
test('removeDefault nested objects', () => {
	let data = [{a:1,b:2,c:4}];
	let reference = [{b:2,c:3}];
	let expected = [{a:1,c:4}];
	expect(app.removeDefault(data, reference)).toEqual(expected);
});
test('removeDefault of more nested objects', () => {
	let data = {a:[{a:5},{a:6}]};
	let reference = {a:[{a:5},{a:6}]};
	let expected = {};
	expect(app.removeDefault(data, reference)).toEqual(expected);
});
test('cleanJson on emtpy json', () => {
	expect(app.cleanJson(undefined)).toEqual(undefined);
	expect(app.cleanJson([])).toEqual([]);
	expect(app.cleanJson({})).toEqual({});
});
test('cleanJson on nested json', () => {
	let data = {a:[]};
	let expected = {};
	expect(app.cleanJson(data)).toEqual(expected);
});
test('cleanJson on more nested json', () => {
	let data = [{},{},{},{}];
	let expected = [];
	expect(app.cleanJson(data)).toEqual(expected);
});
