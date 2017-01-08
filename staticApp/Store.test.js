define(['./Store'], (app) => {
	describe('Store', () => {
		let dummyStore;
		let store;
		const  dummyGet = (id)=>dummyStore[id] ;
		const  dummySet = (id,data)=>dummyStore[id]=data ;
		beforeEach( ()=> {
			dummyStore = {};
			store = new app.Store({"key":"value"},"test",dummyGet,dummySet);
		} );

		it('save only change from default state', () => {
			store.save({"key":"changed"});
			expect(dummyStore["test"]).toEqual({"key":"changed"});
			store.save({"key":"value"});
			expect(dummyStore["test"]).toEqual({});
		});
		it('save only addition from default state', () => {
			store.save({"key":"value","key2":"value"});
			expect(dummyStore["test"]).toEqual({"key2":"value"});
			store.save({"key":"value"});
			expect(dummyStore["test"]).toEqual({});
		});
		it('loadMerged data', () => {
			store.save({"key":"value","key2":"value"});
			expect(dummyStore["test"]).toEqual({"key2":"value"});
			expect(store.load()).toEqual({"key":"value","key2":"value"});
		});
		it('store deletion from defaultState', () => {
			store = new app.Store({"key":[1,2]},"test",dummyGet,dummySet);
			const data = store.load();
			data.key.pop();
			store.save(data);
			expect(dummyStore["test"]).toEqual({"key":[,null]});
			expect(store.load()).toEqual({"key":[1]});
		});
	});
	describe('LocalStore', () => {
		beforeEach( ()=>localStorage.clear() );
		afterEach( ()=>localStorage.clear() );
		it('store in localstorage', () => {
			const store = app.LocalStore({},"test");
			store.save({"key":"value"});

			const newStore = app.LocalStore({},"test");
			expect(newStore.load().key).toBe("value");

			localStorage.clear();
			const emptyStore = app.LocalStore({},"test");
			expect(emptyStore.load().key).not.toBe("value");
		});
	});
	describe('UrlHashStore', () => {
		beforeEach( ()=>history.replaceState({}, document.title, '#') );
		afterEach( ()=>history.replaceState({}, document.title, '#') );
		it('store in url hash', () => {
			const store = app.UrlHashStore({},"test");
			store.save({"key":"value"});

			const newStore = app.UrlHashStore({},"test");
			expect(newStore.load().key).toBe("value");

			history.replaceState({}, document.title, '#');
			const emptyStore = app.UrlHashStore({},"test");
			expect(emptyStore.load().key).not.toBe("value");
		});
	});
});
