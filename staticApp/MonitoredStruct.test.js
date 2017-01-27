define(['./MonitoredStruct', './smartEvents'], function (app, ev) {
	describe('MonitoredStruct', () => {
		let dummyCallback;
		beforeEach(()=>{
			ev.reset();
			dummyCallback = new Spy();
		});
		afterEach(ev.reset);
		it('handle silly objects', () => {
			const observed = new app.MonitoredStruct({tab:[],pasRempli:undefined,vide:null,zero:0,chaineVide:''});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.pasRempli = 'rempli';
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('send event on change', () => {
			const observed = new app.MonitoredStruct({});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.test = 'something';
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('send event with up to date content on change', () => {
			const observed = new app.MonitoredStruct({});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.test = 'something';
			expect(dummyCallback).toHaveBeenCalledWith({'test': 'something'});
		});
		it('send event on sub-change', () => {
			const observed = new app.MonitoredStruct({'sub': {}});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.sub.test = 'something';
			expect(dummyCallback).toHaveBeenCalled();
		});
		it('send event on deep-sub-change', () => {
			const dummyCallback2 = new Spy();
			const observed = new app.MonitoredStruct({'sub': [{'deep': true}]});
			ev.on('monitoredStruct.change', dummyCallback);
			ev.on('monitoredStruct.change.undefined.sub.0.deep', dummyCallback2);
			observed.sub[0].deep = 'not a boolean';
			expect(dummyCallback).toHaveBeenCalledWith({'sub': [{'deep': 'not a boolean'}]});
			expect(dummyCallback.calls.count()).toBe(1);
			expect(dummyCallback2).toHaveBeenCalledWith({'sub': [{'deep': 'not a boolean'}]});
			expect(dummyCallback2.calls.count()).toBe(1);

		});
		it('send event on re-change field', () => {
			const observed = new app.MonitoredStruct({'sub': [{'deep': true}]});
			ev.on('monitoredStruct.change', dummyCallback);
			observed.sub = {'somthing': ['else']};
			expect(dummyCallback).toHaveBeenCalledWith({'sub': {'somthing': ['else']}});
			observed.sub.somthing[1] = 'that';
			observed.sub.somthing.push('matter');
			expect(dummyCallback).toHaveBeenCalledWith({'sub': {'somthing': ['else', 'that', 'matter']}});
		});
		it('cascade event call on cascade change', () => {
			const firstObj = new app.MonitoredStruct([9]);
			ev.on('monitoredStruct.change', dummyCallback);
			ev.on('monitoredStruct.change', (obj) => obj[0] < 5 ? obj[0]++ : 0);
			firstObj[0] = 0;
			expect(dummyCallback).toHaveBeenCalledWith([5]);
			expect(dummyCallback.calls.count()).toBe(6);
		});
		it('send named event on change', () => {
			const dummyCallback2 = new Spy();
			const observed = new app.MonitoredStruct({}, 'name');
			ev.on('monitoredStruct.change.name', dummyCallback);
			ev.on('name', dummyCallback2);
			observed.test = 'something';
			expect(dummyCallback.calls.count()).toBe(1);
			expect(dummyCallback2.calls.count()).toBe(1);
		});
		it('send event on delete', () => {
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
