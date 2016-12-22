define(['./smartEvents'], (ev) => {
	'use strict';

	let fpsTicks, lissageFPS, fpsDisplayerNode, decimalsDisplayed;

	function init(config){
		if(!config) return ev.need('config',init);
		fpsTicks = [];
		fpsDisplayerNode = document.getElementById(config.fps.displayerId);
		lissageFPS = config.fps.sampleOn;
		decimalsDisplayed = config.fps.decimals;
		if (fpsDisplayerNode) setInterval(fpsRefresh, s2ms(config.fps.refreshEvery));
		ev.send('fps.ready');
	}
	function tick() {
		fpsTicks.push(Date.now());
	}
	function fpsCalc() {
		const obsolete = Date.now() - (lissageFPS*1000);
		fpsTicks = fpsTicks.filter(function (t) {
			return t > obsolete;
		});
		return fpsTicks.length / lissageFPS;
	}
	function fpsRefresh() {
		fpsDisplayerNode.innerText = round2Decimal(fpsCalc(),decimalsDisplayed);
	}
	function s2ms(s){
		return Math.floor(s*1000);
	}
	function round2Decimal(number,decimalNumber){
		return Math.round(Math.pow(10,decimalNumber)*number)/Math.pow(10,decimalNumber);
	}

	//TODO: mieux ranger multiTimeout dont le seul lien avec fps est le temps.
	function multiTimeout(frequence, duration, func) {
		for (let t = 0; t < duration; t += frequence) setTimeout(func, t);
	}

	init();
	return {
		init,
		tick,
		fpsCalc,
		multiTimeout
	};

});
