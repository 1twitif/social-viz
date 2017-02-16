define(['./ymlTools', './smartEvents'], (app, ev) => {
	describe('ymlTools', () => {
		beforeEach(()=>{
			ev.reset();
		});
		afterEach(ev.reset);
		it('convert ymlText to jsObject', () => {
			const dummyCallback = new Spy();
			const inputData = {"filename": "osef", "fileContent": "plop:\n  id: 0\n  label: Publication"};
			const expected = {'filename': 'osef', 'yml': {'plop': {'id': 0, 'label': 'Publication'}}};
			ev.on('yml.ready', dummyCallback);
			app.convert(inputData);
			expect(dummyCallback).toHaveBeenCalledWith(expected);
		});
		it('loadFile', (done) => {
			ev.on('file.ready', done);
			app.load('/base/staticApp/ymlTools.js');
		});
		it('multiLoad', (done) => {
			ev.after('file.ready file.ready', done);
			app.multiLoad(['/base/staticApp/ymlTools.js', '/base/staticApp/ymlTools.test.js']);
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
		it("loadMerge with good overwriting",(done)=>{
			app.init();
			//mock à l'arrache
			const backup = window.fetch;
			window.fetch = ()=>{return{then:()=>{return{then:()=>'osef'}}}};

			app.loadMerge(['firstFile','secondFile'],(result)=>{
				expect(result.first).toBe(true);
				expect(result.second).toBe("overwritten");
				done();
			});
			ev.send('file.ready', {'filename': 'secondFile', 'fileContent': "second: overwritten"});
			ev.send('file.ready', {'filename': 'firstFile', 'fileContent': "second: initial\nfirst: true"});

			window.fetch = backup;
		});
	});
});
