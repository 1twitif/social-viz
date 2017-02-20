define([], () => {
	'use strict';
	//TODO: regarder la termionologie du pattern Acteurs et des publish subscribe
	const allListeners = [];
	function reset(){
		while(allListeners.length) allListeners.pop().destroy();
	}

	function send(structuredEventName, eventData) {
		const customEventDetail = {'eventFullName': structuredEventName, 'id': eventId(), 'data': eventData};
		sendFragmentedEvents(structuredEventName, customEventDetail);
	}

	function on(eventName, callback, order=0.5) {
		const viewedId = {};
		const listenerCallback = (e) => {
			if (!e.detail) {
				if (e.type === eventName) callbackOrEventSender(callback, e);
			} else if (!viewedId[e.detail.id]) {
				const eventNameFragments = occurrenceMap(eventName);
				for(let fragment in eventNameFragments) {
					if(e.detail.eventFullName.indexOf(fragment) !== -1) eventNameFragments[fragment]--;
				}
				if (!sumValuesOf(eventNameFragments)){
					viewedId[e.detail.id] = true;
					callbackOrEventSender(callback, e.detail.data);
				}
			}
		};

		const fragments = eventSplitter(eventName);
		const destroyers = fragments.map((f)=>addListener(f,listenerCallback,order));
		const destroyer = {destroy:()=>destroyers.forEach((d)=>d.destroy())};
		allListeners.push(destroyer);
		return destroyer;
	}
	function need(name,callback){
		const oneShotReady = on(name+'.ready',internalCallBack);
		const oneShotAsked = on(name+'.asked',internalCallBack);
		function internalCallBack(res) {
			oneShotAsked.destroy();
			oneShotReady.destroy();
			callback(res);
		}
		send('need.'+name);
	}
	function give(triggerName,givable){
		const getter = mustBeAFunc(givable);
		send(triggerName+".ready", getter());
		return on("need."+triggerName,()=>send(triggerName+".asked", getter()));
	}
	function mustBeAFunc(dataOrFunc){
		return typeof dataOrFunc === "function" ? dataOrFunc : () => dataOrFunc;
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
	function changeInputValue(inputNode, value) {
		let changed = false;
		if(inputNode.nodeName === 'TEXTAREA'){
			if(inputNode.innerText != value){
				inputNode.innerHTML = value;
				changed = true;
			}
		} else {
			if(inputNode.value != value){
				inputNode.value = value;
				changed = true;
			}
		}
		if(changed){
			inputNode.dispatchEvent(new Event('input', {target: inputNode, bubbles: true}));
			inputNode.dispatchEvent(new Event('change', {target: inputNode, bubbles: true}));
		}
	}
	const registredListener = {};
	const eventListenerDestroyer = {};
	function addListener(eventName,callback,order){
		let listenerObj = {"id":eventId(),"order":order,"callback":callback};
		if(registredListener[eventName] && registredListener[eventName].length>0) registredListener[eventName].push(listenerObj);
		else {
			registredListener[eventName] = [];
			registredListener[eventName].push(listenerObj);
			const internalListener = (event)=>{
				for(let i =0; i<registredListener[eventName].length; i++) registredListener[eventName][i].callback(event);
			};
			addEventListener(eventName,internalListener);
			eventListenerDestroyer[eventName] = ()=>removeEventListener(eventName,internalListener);
		}
		registredListener[eventName].sort((a,b)=>a.order - b.order);

		const destroyer = {destroy:()=>{
			registredListener[eventName] = registredListener[eventName].filter( (o)=>o.id !== listenerObj.id );
			if(registredListener[eventName].length === 0) {
				eventListenerDestroyer[eventName]();
			}
		}};
		return destroyer;
	}
	function sendFragmentedEvents(structuredEventName, customEventDetail) {
		fragmentAndApply(structuredEventName,
			(eventPart) => dispatchEvent(new CustomEvent(eventPart, {'detail': customEventDetail}))
		);
	}

	function fragmentAndApply(dotMarkedString, action) {
		eventSplitter(dotMarkedString).forEach(action);
	}
	function eventSplitter(eventName){
		return eventName.split(/ |\./g);
	}

	return {
		send,
		on,
		need,
		give,
		after,
		clickOn,
		changeInputValue,
		callbackOrEventSender,
		reset
	}
});
