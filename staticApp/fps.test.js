define(['./fps','./smartEvents'], (app,ev) => {
	describe('fps', () => {
		describe('unit test', () => {
			it('one tick, one fps', () => {
				app.init({"fps":{"sampleOn":1}});
				app.tick();
				expect(app.fpsCalc()).toBe(1);
			});
			it('two ticks in 2 seconds: one fps', () => {
				app.init({"fps":{"sampleOn":2}});
				app.tick();
				app.tick();
				expect(app.fpsCalc()).toBe(1);
			});
			it('fps forget obsolete tick', () => {
				jasmine.clock().install();
				jasmine.clock().mockDate();
				app.init({"fps":{"sampleOn":5}});
				app.tick();
				jasmine.clock().tick(4000);
				expect(app.fpsCalc()).toBe(0.2);
				jasmine.clock().tick(1000);
				expect(app.fpsCalc()).toBe(0);
				jasmine.clock().uninstall();
			});
		});
		describe('integrated test', () => {
			beforeEach(function() {
				jasmine.clock().install();
				jasmine.clock().mockDate();
				const displayerId = "fpsValue";
				document.body.id = displayerId;
				app.init();
				ev.send('config.ready',{"fps":{"sampleOn":7,"refreshEvery":3,"decimals":2,"displayerId":displayerId}});
			});
			afterEach(function() {
				jasmine.clock().uninstall();
			});
			it('display fps rounded at 2 decimals', () => {
				app.tick();
				jasmine.clock().tick(2999);
				expect(document.body.innerText).toEqual('');
				jasmine.clock().tick(1);
				expect(parseFloat(document.body.innerText)).toEqual(0.14);
			});
		});
		describe('multiTimeout', () => {
			let dummyCallback;
			beforeEach(function() {
				jasmine.clock().install();
				jasmine.clock().mockDate();
				dummyCallback = new Spy();
			});
			afterEach(function() {
				jasmine.clock().uninstall();
			});
			it('call it callback regulary until limit', () => {
				app.multiTimeout(10, 50, dummyCallback);
				jasmine.clock().tick(1);
				expect(dummyCallback.calls.count()).toBe(1);
				jasmine.clock().tick(9);
				expect(dummyCallback.calls.count()).toBe(2);
				jasmine.clock().tick(40);
				expect(dummyCallback.calls.count()).toBe(5);
				jasmine.clock().tick(1000);
				expect(dummyCallback.calls.count()).toBe(5);
			});
		});
	});
});
