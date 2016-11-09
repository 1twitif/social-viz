const ev = require('./eventShortcut');
const app = require('./ymlTools');

test('convert ymlText to jsObject', () => {
	const dummyCallback = jest.fn();
	const inputData = {'filename': 'osef', 'fileContent': 'plop: {id: 0, label: Publication}'};
	const expected = {'filename': 'osef', 'yml': {'plop': {'id': 0, 'label': 'Publication'}}};
	ev.on('ymlReady', dummyCallback);
	app.convert(inputData);
	expect(dummyCallback).lastCalledWith(expected);
});
/*test('loadFile', () => { // fetch only available in browser context
	const dummyCallback = jest.fn();
	ev.on('fileLoaded', dummyCallback);
	app.load('ymlTools.js');
	expect(dummyCallback).toBeCalled();
});*/
test('eventAggregator test', () => {
	const dummyCallback = jest.fn();
	ev.on('finish', dummyCallback);
	app.eventAggregator('dummy',
		(a)=>a.count?a.count++:a.count=1,
		(a)=>a.count===3,
		'finish');
	ev.send('dummy');
	ev.send('dummy');
	expect(dummyCallback).not.toBeCalled();
	ev.send('dummy');
	expect(dummyCallback).toBeCalled();
});
test('buildFunc_aggregateLengthTrigger with object', () => {
	const comparator = app.buildFunc_aggregateLengthTrigger(5);
	const testDataTrue = {a1:2,a2:2,a3:2,a4:2,a5:2};
	expect(comparator(testDataTrue)).toBe(true);
});
test('buildFunc_aggregateLengthTrigger with array', () => {
	const comparator = app.buildFunc_aggregateLengthTrigger(5);
	const testDataTrue = [2,2,2,2,2];
	expect(comparator(testDataTrue)).toBe(true);
});
