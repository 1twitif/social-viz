(() => {
	const dependencies = [];
	const libEnv = function () {
		'use strict';
		function send(eventName, eventData) {
			dispatchEvent(new CustomEvent(eventName, {'detail': eventData}));
		}

		function on(eventName, callback) {
			const listenerCallback = (e) => (e.detail) ? callback(e.detail) : callback(e);
			addEventListener(eventName, listenerCallback);
			return {destroy: () => removeEventListener(eventName, listenerCallback)};
		}

		function callbackOrEventSender(callbackOrEvent, data) {
			if (typeof callbackOrEvent === "string") return send(callbackOrEvent, data);
			if (typeof callbackOrEvent === "function") return callbackOrEvent(data);
			throw new Error('paramètres non supportés : ' + callbackOrEvent);
		}

		return {
			send,
			on,
			callbackOrEventSender
		}
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined') {
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();
