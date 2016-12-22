define(['./smartEvents'], (app) => {
	describe('smartEvents', () => {
		beforeEach(()=>{
			app.reset();
		});
		it('send & receive basic event', (done) => {
			const eventName = 'anEvent';
			app.on(eventName, done);
			app.send(eventName);
		});
		it('event send & receive with data', () => {
			const dummyCallback = new Spy();
			const eventName = 'anEvent';
			const eventData = {'plop': 5, 'plip': 3};
			app.on(eventName, dummyCallback);
			app.send(eventName, eventData);
			expect(dummyCallback).toHaveBeenCalledWith(eventData);
		});
		it('not custom event catch', () => {
			const dummyCallback = new Spy();
			const eventName = 'hashchange';
			app.on(eventName, dummyCallback);
			dispatchEvent(new HashChangeEvent(eventName));
			expect(dummyCallback).toHaveBeenCalled();
			expect(dummyCallback).not.toHaveBeenCalledWith(undefined);
		});
		it('destroyable listener', () => {
			const dummyCallback = new Spy();
			const eventName = 'anEvent';
			let listener = app.on(eventName, dummyCallback);
			app.send(eventName);
			listener.destroy();
			app.send(eventName);
			expect(dummyCallback.calls.count()).toBe(1);
		});
		it('destroyable listener without conflicts', () => {
			const dummyCallback1 = new Spy();
			const dummyCallback2 = new Spy();
			const dummyCallback3 = new Spy();
			const eventName = 'anEvent';
			let listener1 = app.on(eventName, dummyCallback1);
			let listener2 = app.on(eventName, dummyCallback2);
			let listener3 = app.on(eventName, dummyCallback3);
			app.send(eventName);
			listener2.destroy();
			app.send(eventName);
			expect(dummyCallback1.calls.count()).toBe(2);
			expect(dummyCallback2.calls.count()).toBe(1);
			expect(dummyCallback3.calls.count()).toBe(2);
		});
		it('structured event send & receive', () => {
			const globalCallback = new Spy();
			const moreSpecificCallback = new Spy();
			const eventName = 'global.sub.moreSpecific';
			const eventData = 5;
			app.on('global', globalCallback);
			app.on('global.sub.moreSpecific', moreSpecificCallback);
			app.send(eventName, eventData);
			expect(globalCallback).toHaveBeenCalledWith(eventData);
			expect(moreSpecificCallback).toHaveBeenCalledWith(eventData);
		});
		it('part of structured event send & receive', () => {
			const subCallback = new Spy();
			const eventName = 'global.sub.moreSpecific';
			const eventData = 5;
			app.on('sub', subCallback);
			app.send(eventName, eventData);
			expect(subCallback).toHaveBeenCalledWith(eventData);
		});
		it('unordered part of structured event send & receive', (done) => {
			app.on('global.sub any', done);
			app.send('any.global.sub.moreSpecific');
		});
		it('unordered part catch with standard change event', () => {
			const dummyCallback = new Spy();
			app.on('config change', dummyCallback);
			app.send('config.change');
			expect(dummyCallback.calls.count()).toBe(1);
		});
		it('dont listen incorrect structured event', () => {
			const neverCalledCallback = new Spy();
			const eventName = 'global.sub.moreSpecific';
			const eventData = 5;
			app.on('global.moreSpecific', neverCalledCallback);
			app.send(eventName, eventData);
			expect(neverCalledCallback).not.toHaveBeenCalled();
		});
		it('dont listen too generic event', () => {
			const dummyCallback = new Spy();
			app.on('hashchange.moreSpecific', dummyCallback);
			dispatchEvent(new HashChangeEvent('hashchange'));
			expect(dummyCallback).not.toHaveBeenCalled();
			app.send('hashchange.moreSpecific.really');
			expect(dummyCallback).toHaveBeenCalled();
		});

		it('clean destroy of structured event listener', () => {
			const dummyCallback1 = new Spy();
			const dummyCallback2 = new Spy();
			const dummyCallback3 = new Spy();
			const eventName = 'an.event';
			let listener1 = app.on(eventName, dummyCallback1);
			let listener2 = app.on('event', dummyCallback2);
			let listener3 = app.on(eventName, dummyCallback3);
			app.send(eventName);
			listener2.destroy();
			listener3.destroy();
			app.send(eventName);
			expect(dummyCallback1.calls.count()).toBe(2);
			expect(dummyCallback2.calls.count()).toBe(1);
			expect(dummyCallback3.calls.count()).toBe(1);
		});

		it('need available thing', (done) => {
			app.on('need.config', ()=>app.send('config.asked'));
			app.need('config',done);
		});
		it('need futur thing', (done) => {
			app.need('config',done);
			app.send('config.ready');
		});
		it('need trigger only once', () => {
			const dummyCallback = new Spy();
			app.on('need.config', ()=>app.send('config.asked'));
			app.need('config',dummyCallback);
			app.send('config.ready');
			app.send('config.ready');
			expect(dummyCallback.calls.count()).toBe(1);
		});

		it('give send givable when called', (done) => {
			app.on('callGivable.ready', done);
			app.give('callGivable','someConfig');
		});
		it('give send givable when asked by event', (done) => {
			app.give('askedGivable','someConfig');
			app.need('askedGivable',done);
		});
		it('give send givable return if givable is a function', (done) => {
			const g = {};
			function getG(){return g;}
			app.give('funcGivable',getG);
			g.update = true;
			app.need('funcGivable', (res)=> res.update ? done() :0 );
		});
		it('destroyable give', () => {
			const dummyCallback = new Spy();
			const first = app.give('config', 'firstConfig');
			const second = app.give('config', 'secondConfig');
			app.on('config.asked',dummyCallback);
			app.send('need.config');
			expect(dummyCallback.calls.count()).toBe(2);
			first.destroy();
			app.send('need.config');
			expect(dummyCallback.calls.count()).toBe(3);
		});


		it('callback after an event list reached', () => {
			const dummyCallback = new Spy();
			app.after('a b c d.e f g', dummyCallback);
			app.send('a');
			app.send('b.osef');
			app.send('osef.c');
			app.send('d.e.f');
			expect(dummyCallback).not.toHaveBeenCalled();
			app.send('g');
			expect(dummyCallback.calls.count()).toBe(1);
		});
		it('callback after an event array list reached', () => {
			const dummyCallback = new Spy();
			app.after(['a','b'], dummyCallback);
			app.send('a');
			app.send('b');
			expect(dummyCallback.calls.count()).toBe(1);
		});
		it('callback after an event list including multiple time same event', () => {
			const dummyCallback = new Spy();
			app.after('a b a', dummyCallback);
			app.send('b');
			app.send('a');
			expect(dummyCallback).not.toHaveBeenCalled();
			app.send('a');
			expect(dummyCallback.calls.count()).toBe(1);
		});
		it('callback after an event list called only once', () => {
			const dummyCallback = new Spy();
			app.after('a', dummyCallback);
			app.send('a');
			expect(dummyCallback.calls.count()).toBe(1);
			app.send('a');
			expect(dummyCallback.calls.count()).toBe(1);
		});
	});
	it('simulateClick', (done) => {
		app.on('click', done);
		app.clickOn(window);
	});
	describe('callbackOrEventSender', () => {
		it('call callback', () => {
			const dummyCallback = new Spy();
			const data = 'someData';
			app.callbackOrEventSender(dummyCallback, data);
			expect(dummyCallback).toHaveBeenCalledWith(data);
		});
		it('send event', () => {
			const eventName = 'anEvent';
			const dummyCallback = new Spy();
			const data = 'someData';
			app.on(eventName, dummyCallback);
			app.callbackOrEventSender(eventName, data);
			expect(dummyCallback).toHaveBeenCalledWith(data);
		});
		it('throw error if unknown', () => {
			const eventName = undefined;
			expect( () => app.callbackOrEventSender(eventName) ).toThrow(new Error("Parameter is nor an eventName nor a callbackFunc : undefined"));
		});
	});

});
