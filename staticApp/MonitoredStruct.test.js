const ev = require('./smartEvents');
const app = require('./MonitoredStruct');

test('send event on change', () => {
	const dummyCallback = jest.fn();
	const observed = new app.MonitoredStruct({});
	ev.on('monitoredStruct.change', dummyCallback);
	observed.test = 'something';
	expect(dummyCallback).toBeCalled();
});
test('send event with up to date content on change', () => {
	const dummyCallback = jest.fn();
	const observed = new app.MonitoredStruct({});
	ev.on('monitoredStruct.change', dummyCallback);
	observed.test = 'something';
	expect(dummyCallback).lastCalledWith({'test':'something'});
});
test('send event on sub-change', () => {
	const dummyCallback = jest.fn();
	const observed = new app.MonitoredStruct({'sub':{}});
	ev.on('monitoredStruct.change', dummyCallback);
	observed.sub.test = 'something';
	expect(dummyCallback).toBeCalled();
});
test('send event on deep-sub-change', () => {
	const dummyCallback = jest.fn();
	const observed = new app.MonitoredStruct({'sub':[{'deep':true}]});
	ev.on('monitoredStruct.change', dummyCallback);
	observed.sub[0].deep = 'not a boolean';
	expect(dummyCallback).lastCalledWith({'sub':[{'deep':'not a boolean'}]});
});
test('send event on re-change field', () => {
	const dummyCallback = jest.fn();
	const observed = new app.MonitoredStruct({'sub':[{'deep':true}]});
	ev.on('monitoredStruct.change', dummyCallback);
	observed.sub = {'somthing':['else']};
	expect(dummyCallback).lastCalledWith({'sub':{'somthing':['else']}});
	observed.sub.somthing[1] = 'that';
	observed.sub.somthing.push('matter');
	expect(dummyCallback).lastCalledWith({'sub':{'somthing':['else','that','matter']}});
});
test('cascade event call on cascade change', () => {
	const dummyCallback = jest.fn();
	const firstObj = new app.MonitoredStruct([9]);
	ev.on('monitoredStruct.change', dummyCallback);
	ev.on('monitoredStruct.change', (obj)=>obj[0]<5?obj[0]++:0);
	firstObj[0]= 0;
	expect(dummyCallback).lastCalledWith([5]);
	expect(dummyCallback).toHaveBeenCalledTimes(6);
});
test('send named event on change', () => {
	const dummyCallback1 = jest.fn();
	const dummyCallback2 = jest.fn();
	const dummyCallback3 = jest.fn();
	const observed = new app.MonitoredStruct({},'name');
	ev.on('monitoredStruct.change.name', dummyCallback1);
	ev.on('monitoredStruct.change', dummyCallback2);
	ev.on('name', dummyCallback3);
	observed.test = 'something';
	expect(dummyCallback1).toHaveBeenCalledTimes(1);
	expect(dummyCallback2).toHaveBeenCalledTimes(1);
	expect(dummyCallback3).toHaveBeenCalledTimes(1);
});
test('send event on delete', () => {
	const dummyCallback = jest.fn();
	const observed = new app.MonitoredStruct({'sub':true});
	ev.on('monitoredStruct.delete', dummyCallback);
	delete observed.sub;
	expect(dummyCallback).toHaveBeenCalledTimes(1);
	expect(observed.hasOwnProperty('sub')).toBeFalsy();
});
