define(['./keyRecorder'], (app) => {
	describe('keyRecorder', () => {
		it('record unexistant key', () => {
			const trackedMap = {};
			const smartMap = new app.KeyRecorder(trackedMap);
			expect(trackedMap.hasOwnProperty('aKey')).toBeFalsy();
			expect(trackedMap.hasOwnProperty('aKey')).toBeFalsy();
			smartMap['aKey'];
			expect(trackedMap.hasOwnProperty('aKey')).toBeTruthy();
		});
		it("don't change existing key", () => {
			const trackedMap = {"existingKey":'itValue'};
			const smartMap = new app.KeyRecorder(trackedMap);
			smartMap['existingKey'];
			expect(trackedMap["existingKey"]).toEqual('itValue');
		});
	});
});
