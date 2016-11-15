(() => {
	const dependencies = [
		'./structManipulation'
	];
	const libEnv = function (struct) {
		'use strict';

		function Url(defaultState) {
			// private attributs
			const referenceState = struct.clone(defaultState);

			// private methods
			const pushInHash = function pushInHash(json, title) {
				history.pushState({}, title, '#' + JSON.stringify(json));
				dispatchEvent(new HashChangeEvent("hashchange"));
			};
			const replaceHash = function replaceHash(json) {
				history.replaceState({}, document.title, '#' + JSON.stringify(json));
				dispatchEvent(new HashChangeEvent("hashchange"));
			};
			const jsonFromHash = function jsonFromHash() {
				return window.location.hash ? JSON.parse(decodeURIComponent(window.location.hash).substr(1)) : {};
			};

			// public methods
			this.load = function load() {
				return struct.merge(referenceState, jsonFromHash());
			};
			this.save = function save(json, newPageTitle) {
				const lastState = this.load();
				const newState = struct.removeDefault(struct.merge(lastState, json), referenceState);
				if (newPageTitle) pushInHash(newState, newPageTitle);
				else replaceHash(newState);
			};
		}

		return {
			Url
		}
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
// AMD
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();
