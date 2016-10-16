var fpsTicks = [];
var lissageFPS = 5;
function fpsTick(){
	fpsTicks.push(Date.now());
}
function fpsCalc(){
	var obsolete = Date.now()-(lissageFPS*1000);
	fpsTicks = fpsTicks.filter(function(t){ return t>obsolete; });
	return Math.round(fpsTicks.length/lissageFPS);
}
function fpsRefresh(){
	document.getElementById('fpsValue').innerText = fpsCalc();
}
setInterval(fpsRefresh,1000);
