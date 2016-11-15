define(['./ymlTools', './smartEvents'], (app, ev) => {
	describe('ymlTools', () => {
		it('convert ymlText to jsObject', () => {
			const dummyCallback = new Spy();
			const inputData = {'filename': 'osef', 'fileContent': 'plop: {id: 0, label: Publication}'};
			const expected = {'filename': 'osef', 'yml': {'plop': {'id': 0, 'label': 'Publication'}}};
			ev.on('ymlReady', dummyCallback);
			app.convert(inputData);
			expect(dummyCallback).toHaveBeenCalledWith(expected);
		});
		xit('loadFile', () => { // fetch only available in browser context
		 const dummyCallback = new Spy();
		 ev.on('fileLoaded', dummyCallback);
		 app.load('osef.js');
		 expect(dummyCallback).toHaveBeenCalled();
		 });
		it('eventAggregator test', () => {
			const dummyCallback = new Spy();
			ev.on('finish', dummyCallback);
			app.eventAggregator('dummy',
				(a) => a.count ? a.count++ : a.count = 1,
				(a) => a.count === 3,
				'finish');
			ev.send('dummy');
			ev.send('dummy');
			expect(dummyCallback).not.toHaveBeenCalled();
			ev.send('dummy');
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('buildFunc_aggregateLengthTrigger with object', () => {
			const comparator = app.buildFunc_aggregateLengthTrigger(5);
			const testDataTrue = {a1: 2, a2: 2, a3: 2, a4: 2, a5: 2};
			expect(comparator(testDataTrue)).toBe(true);
		});
		it('buildFunc_aggregateLengthTrigger with array', () => {
			const comparator = app.buildFunc_aggregateLengthTrigger(5);
			const testDataTrue = [2, 2, 2, 2, 2];
			expect(comparator(testDataTrue)).toBe(true);
		});
	});
});
