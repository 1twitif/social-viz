define([
	'./tradChooser',
	'./tradLoader',
	'./tradRenderer',
	'./tradEditor'
], (tChooser, tLoader, tRenderer, tEditor) => {
	function init() {
		tChooser.init();
		tLoader.init();
		tRenderer.init();
		tEditor.init();
	}

	return {
		init,
		"t":tRenderer.t
	};
});
