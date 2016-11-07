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
