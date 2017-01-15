define(['./smartEvents'], (ev) => {
	'use strict';
	function reset() {

	}
	function init() {
		ev.on('config.selected change', (selected)=>saveStateInHistory(selected) ); // aller chercher le label
		ev.on('config.userMode change', (selected)=>saveStateInHistory(selected) );
		// selected < mode < titre site ou mode:selected avec mode en une seule lettre.
		//ev.on('config.search change', (selected)=>saveStateInHistory(selected) );
		// ne mémoriser la recherche qu'au changement de mode, pas à chaque saisie de caractère durant la frappe.
		//TODO: title traduit et composé d'une partie fixe et d'une partie variable également userfriendly.
	}

	function saveStateInHistory(title) {
		document.title = title;
		history.pushState({}, title, location.hash);
	}

	return {
		reset,
		init
	}
});
