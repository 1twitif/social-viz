define([], () => {
	'use strict';
	let tradData = {};

	function setTrad(tradMap){
		tradData = tradMap;
	}
	function t(translateMe) {
		if (tradData[translateMe])
			return tradData[translateMe];
		else return translateMe;
	}

	return {
		t,
		setTrad
	}
});
