define([], () => {
	'use strict';

	function send(structuredEventName, eventData) {
		const customEventDetail = {'eventFullName': structuredEventName, 'id': eventId(), 'data': eventData};
		sendFragmentedEvents(structuredEventName, customEventDetail);
	}

	function on(eventName, callback) {
		const viewedId = {};
		const listenerCallback = (e) => {
			if (!e.detail) {
				if (e.type === eventName) callbackOrEventSender(callback, e);
			} else if (!viewedId[e.detail.id]) {
				const eventNameFraments = occurrenceMap(eventName);
				for(let fragment in eventNameFraments) {
					if(e.detail.eventFullName.indexOf(fragment) !== -1) eventNameFraments[fragment]--;
				}
				if (!sumValuesOf(eventNameFraments)){
					viewedId[e.detail.id] = true;
					callbackOrEventSender(callback, e.detail.data);
				}
			}
		};
		const listen = build_fragmentListener(eventName, listenerCallback);
		listen();
		return {destroy: build_fragmentDestroyer(eventName, listenerCallback)};
	}

	function after(eventList,callbackOrEvent){
		const eventsTriggerMap = occurrenceMap(eventList);
		const aggregator = {};
		for(let eventName in eventsTriggerMap){
			((eventName)=> {
				let listener = on(eventName, (eventData) => {
					--eventsTriggerMap[eventName];
					if (!eventsTriggerMap[eventName]) listener.destroy();
					aggregator[eventName] = eventData;
					if (!sumValuesOf(eventsTriggerMap)) callbackOrEventSender(callbackOrEvent, aggregator);
				});
			})(eventName);
		}
	}
	function sumValuesOf(obj){
		return Object.keys(obj).reduce( (sum,key)=>sum+obj[key], 0 );
	}
	function occurrenceMap(stringOrArray){
		let array = stringOrArray;
		if(typeof array === 'string') array = array.split(' ');
		return array2occurrenceMap(array);
	}
	function array2occurrenceMap(array){
		const occurrenceMap = {};
		for(let i=0;i<array.length;i++) occurrenceMap[array[i]]= occurrenceMap[array[i]] ? 1+occurrenceMap[array[i]] : 1;
		return occurrenceMap;
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
		dotMarkedString.split(/ |\./g).forEach(action);
	}

	return {
		send,
		on,
		after,
		clickOn,
		callbackOrEventSender
	}
});
