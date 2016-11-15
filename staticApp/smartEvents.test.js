define(['./smartEvents'], (app) => {
	describe('smartEvents', () => {
		it('send & receive basic event', () => {
			const dummyCallback = new Spy();
			const eventName = 'anEvent';
			app.on(eventName, dummyCallback);
			app.send(eventName);
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('basic event send & receive', () => {
			const dummyCallback = new Spy();
			const eventName = 'anEvent';
			app.on(eventName, dummyCallback);
			app.send(eventName);
			expect(dummyCallback).toHaveBeenCalled();
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
		it('dont listen incorrect structured event send & receive', () => {
			const neverCalledCallback = new Spy();
			const eventName = 'global.sub.moreSpecific';
			const eventData = 5;
			app.on('global.moreSpecific', neverCalledCallback);
			app.send(eventName, eventData);
			expect(neverCalledCallback).not.toHaveBeenCalled();
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
