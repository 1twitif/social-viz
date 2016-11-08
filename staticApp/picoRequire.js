'use strict';
let filesCache = JSON.parse(localStorage.getItem('filesCache')) || {};
function need(file){
	if(!filesCache[file]) getThisFileNow(file);
	else updateThisFile(file);
	window[ "eval" ].call( window, filesCache[file] ); //FIXME: less evil ?
}
function getThisFileNow(file){
	let request = new XMLHttpRequest();
	request.open('GET', file, false);  // `false` makes the request synchronous
	request.send(null);
	if (request.status === 200) {
		updateCache(file,request.responseText);
		return request.responseText;
	} else console.log('Erreur chargement fichier : ',request);
}
function updateThisFile(file){
	let request = new XMLHttpRequest();
	request.open('GET', file, true);
	request.onreadystatechange = function (e) {
		if (request.readyState == 4) {
			if(request.status == 200) updateCache(file,request.responseText);
			else console.log('Erreur chargement fichier : ',request);
		}
	};
	request.send(null);
/*	fetch(file)
		.then( (response)=> response.text())
		.then( (text) => updateCache(file,text) );*/
}
function updateCache(file,data){
	filesCache[file] = data;
	localStorage.setItem('filesCache',JSON.stringify(filesCache));
}
