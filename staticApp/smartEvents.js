define([], () => {
	'use strict';

	function send(structuredEventName, eventData) {
		const customEventDetail = {'eventFullName': structuredEventName, 'id': eventId(), 'data': eventData};
		sendFragmentedEvents(structuredEventName, customEventDetail);
	}

	function on(eventName, callback) {
		const viewedId = {};
		const listenerCallback = (e) => {
			if (!e.detail) callbackOrEventSender(callback, e);
			else if (e.detail.eventFullName.indexOf(eventName) !== -1 && !viewedId[e.detail.id]) {
				viewedId[e.detail.id] = true;
				callbackOrEventSender(callback, e.detail.data);
			}
		};
		const listen = build_fragmentListener(eventName, listenerCallback);
		listen();
		return {destroy: build_fragmentDestroyer(eventName, listenerCallback)};
	}

	function callbackOrEventSender(callbackOrEvent, data) {
		if (typeof callbackOrEvent === "string") return send(callbackOrEvent, data);
		if (typeof callbackOrEvent === "function") return callbackOrEvent(data);
		throw new Error('Parameter is nor an eventName nor a callbackFunc : ' + callbackOrEvent);
	}

	function eventId() {
		return Date.now() + '-' + Math.random();
	}
	function clickOn(element) {
		const event = new MouseEvent('click', { 'view': window, 'bubbles': true, 'cancelable': true });
		element.dispatchEvent(event);
	}
	function build_fragmentListener(eventName, listenerCallback) {
		return build_fragmentActionFunc(addEventListener, eventName, listenerCallback);
	}

	function build_fragmentDestroyer(eventName, listenerCallback) {
		return build_fragmentActionFunc(removeEventListener, eventName, listenerCallback);
	}

	function build_fragmentActionFunc(action, structuredEventName, listenerCallback) {
		return () => fragmentAndApply(structuredEventName, (eventPart) => action(eventPart, listenerCallback));
	}

	function sendFragmentedEvents(structuredEventName, customEventDetail) {
		fragmentAndApply(structuredEventName,
			(eventPart) => dispatchEvent(new CustomEvent(eventPart, {'detail': customEventDetail}))
		);
	}

	function fragmentAndApply(dotMarkedString, action) {
		dotMarkedString.split('.').forEach(action);
	}

	return {
		send,
		on,
		clickOn,
		callbackOrEventSender
	}
});
