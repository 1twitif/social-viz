define(['./MonitoredStruct', './smartEvents'], function (app, ev) {
	describe('MonitoredStruct', () => {
		it('send event on change', () => {
			const dummyCallback = new Spy();
			const observed = new app.MonitoredStruct({});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.test = 'something';
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('send event with up to date content on change', () => {
			const dummyCallback = new Spy();
			const observed = new app.MonitoredStruct({});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.test = 'something';
			expect(dummyCallback).toHaveBeenCalledWith({'test': 'something'});
		});
		it('send event on sub-change', () => {
			const dummyCallback = new Spy();
			const observed = new app.MonitoredStruct({'sub': {}});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.sub.test = 'something';
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('send event on deep-sub-change', () => {
			const dummyCallback = new Spy();
			const observed = new app.MonitoredStruct({'sub': [{'deep': true}]});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.sub[0].deep = 'not a boolean';
			expect(dummyCallback).toHaveBeenCalledWith({'sub': [{'deep': 'not a boolean'}]});
		});
		it('send event on re-change field', () => {
			const dummyCallback = new Spy();
			const observed = new app.MonitoredStruct({'sub': [{'deep': true}]});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.sub = {'somthing': ['else']};
			expect(dummyCallback).toHaveBeenCalledWith({'sub': {'somthing': ['else']}});
			observed.sub.somthing[1] = 'that';
			observed.sub.somthing.push('matter');
			expect(dummyCallback).toHaveBeenCalledWith({'sub': {'somthing': ['else', 'that', 'matter']}});
		});
		it('cascade event call on cascade change', () => {
			const dummyCallback = new Spy();
			const firstObj = new app.MonitoredStruct([9]);
			ev.on('monitoredStruct.change', dummyCallback);
			ev.on('monitoredStruct.change', (obj) => obj[0] < 5 ? obj[0]++ : 0);
			firstObj[0] = 0;
			expect(dummyCallback).toHaveBeenCalledWith([5]);
			expect(dummyCallback.calls.count()).toBe(6);
		});
		it('send named event on change', () => {
			const dummyCallback1 = new Spy();
			const dummyCallback2 = new Spy();
			const dummyCallback3 = new Spy();
			const observed = new app.MonitoredStruct({}, 'name');
			ev.on('monitoredStruct.change.name', dummyCallback1);
			ev.on('monitoredStruct.change', dummyCallback2);
			ev.on('name', dummyCallback3);
			observed.test = 'something';
			expect(dummyCallback1.calls.count()).toBe(1);
			expect(dummyCallback2.calls.count()).toBe(1);
			expect(dummyCallback3.calls.count()).toBe(1);
		});
		it('send event on delete', () => {
			const dummyCallback = new Spy();
			const observed = new app.MonitoredStruct({'sub': true});
			ev.on('monitoredStruct.delete', dummyCallback);
			delete observed.sub;
			expect(dummyCallback.calls.count()).toBe(1);
			expect(observed.hasOwnProperty('sub')).toBeFalsy();
		});
	});
	describe('unOverwritableGlobalConst', () => {
		it('not overwritable, but internaly changeable.', () => {
			app.unOverwritableGlobalConst('dummy', {'do': 'me'});
			try {
				window.dummy = 'osef';
			} catch (obj) {
			}
			expect(dummy).toEqual({'do': 'me'});
			dummy['do'] = 'you';
			expect(dummy).toEqual({'do': 'you'});
		});
	});
});
