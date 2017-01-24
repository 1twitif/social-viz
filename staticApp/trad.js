define([
	'./tradChooser',
	'./tradLoader',
	'./tradRenderer'
], (tChooser, tLoader, tRenderer) => {
	function init() {
		tChooser.init();
		tLoader.init();
		tRenderer.init();
		//tEditor.init();
	}

	return {
		init,
		"t":tRenderer.t
	};
});
