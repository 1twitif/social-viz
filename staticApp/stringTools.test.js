define(['./stringTools'], (app) => {
	describe('stringTools', () => {
		it('filter string for safe id or url usage', () => {
			expect(app.clean('!safe Labél')).toBe('-safe-Label');
		});
	});
});
