const app = require('./eventShortcut');
test('basic event send & receive', () => {
	const dummyCallback = jest.fn();
	const eventName = 'anEvent';
	app.on(eventName,dummyCallback);
	app.send(eventName);
	expect(dummyCallback).toBeCalled();
});
test('event send & receive with data', () => {
	const dummyCallback = jest.fn( (e)=> e );
	const eventName = 'anEvent';
	const eventData = {'plop':5,'plip':3};
	app.on(eventName,dummyCallback);
	app.send(eventName,eventData);
	expect(dummyCallback).lastCalledWith(eventData);
});
test('not custom event catch', () => {
	const dummyCallback = jest.fn();
	const eventName = 'hashchange';
	app.on(eventName,dummyCallback);
	dispatchEvent(new HashChangeEvent(eventName));
	expect(dummyCallback).toBeCalled();
	expect(dummyCallback).not.lastCalledWith(undefined);
});
test('destroyable listener', () => {
	const dummyCallback = jest.fn();
	const eventName = 'anEvent';
	let listener = app.on(eventName,dummyCallback);
	app.send(eventName);
	listener.destroy();
	app.send(eventName);
	expect(dummyCallback).toHaveBeenCalledTimes(1);
});
test('destroyable listener without conflicts', () => {
	const dummyCallback1 = jest.fn();
	const dummyCallback2 = jest.fn();
	const dummyCallback3 = jest.fn();
	const eventName = 'anEvent';
	let listener1 = app.on(eventName,dummyCallback1);
	let listener2 = app.on(eventName,dummyCallback2);
	let listener3 = app.on(eventName,dummyCallback3);
	app.send(eventName);
	listener2.destroy();
	app.send(eventName);
	expect(dummyCallback1).toHaveBeenCalledTimes(2);
	expect(dummyCallback2).toHaveBeenCalledTimes(1);
	expect(dummyCallback3).toHaveBeenCalledTimes(2);
});
test('callbackOrEventSender -> callback case', () => {
	const dummyCallback = jest.fn();
	const data = 'someData';
	app.callbackOrEventSender(dummyCallback,data);
	expect(dummyCallback).lastCalledWith(data);
});
test('callbackOrEventSender -> event case', () => {
	const eventName = 'anEvent';
	const dummyCallback = jest.fn();
	const data = 'someData';
	app.on(eventName,dummyCallback);
	app.callbackOrEventSender(eventName,data);
	expect(dummyCallback).lastCalledWith(data);
});

