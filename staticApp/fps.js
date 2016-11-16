define([], () => {
	'use strict';

	let fpsTicks = [];
	const lissageFPS = 5;

	function tick() {
		fpsTicks.push(Date.now());
	}

	function fpsCalc() {
		const obsolete = Date.now() - (lissageFPS * 1000);
		fpsTicks = fpsTicks.filter(function (t) {
			return t > obsolete;
		});
		return Math.round(fpsTicks.length / lissageFPS);
	}

	function fpsRefresh() {
		const node = document.getElementById('fpsValue');
		if (node) node.innerText = fpsCalc();
	}

	setInterval(fpsRefresh, 1000);
	function multiTimeout(frequence, duration, func) {
		for (let t = 0; t < duration; t += frequence) setTimeout(func, t);
	}

	return {
		tick,
		multiTimeout
	};

});
