define([], () => {
	'use strict';
	//TODO: regarder la termionologie du pattern Acteurs et des publish subscribe
	const allListeners = []; // for reset

	let registeredListener = {}; // for addListener
	let eventListenerDestroyer = {}; // for addListener

	function reset(){
		while(allListeners.length) allListeners.pop().destroy();
		registeredListener = {};
		eventListenerDestroyer = {};
		//for(let key in registeredListener) if(registeredListener.hasOwnProperty(key)) delete registeredListener[key];
		//for(let key in eventListenerDestroyer) if(registeredListener.hasOwnProperty(key)) delete eventListenerDestroyer[key];
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
	function need(name,callbackOrEvent){
		const oneShotReady = on(name+'.ready',internalCallBack);
		const oneShotAsked = on(name+'.asked',internalCallBack);
		function internalCallBack(res) {
			oneShotAsked.destroy();
			oneShotReady.destroy();
			callbackOrEventSender(callbackOrEvent, res);
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
	function addListener(eventName,callback,order){
		let listenerObj = {"id":eventId(),"order":order,"callback":callback};
		if(registeredListener[eventName] && registeredListener[eventName].length>0) registeredListener[eventName].push(listenerObj);
		else {
			registeredListener[eventName] = [];
			registeredListener[eventName].push(listenerObj);
			const internalListener = (event)=>{
				if(Array.isArray(registeredListener[eventName])) {
					registeredListener[eventName] = registeredListener[eventName].filter((e) => !!e);
					for (let i = 0; i < registeredListener[eventName].length; i++) {
						if(registeredListener[eventName][i]) registeredListener[eventName][i].callback(event);
						if (!registeredListener[eventName]) break;
					}
				}
			};
			addEventListener(eventName,internalListener);
			eventListenerDestroyer[eventName] = ()=>removeEventListener(eventName,internalListener);
		}
		registeredListener[eventName].sort((a,b)=>a.order - b.order);

		const destroyer = {destroy:()=>{
			if(!registeredListener[eventName]) return; // reset proof
			//if(eventName === "any") console.log("allListener", allListeners);
			registeredListener[eventName].forEach( (ordered,i)=>{
				if(ordered.id === listenerObj.id) delete registeredListener[eventName][i];
			} );
			/*
			if(registeredListener[eventName].length === 0) {
				eventListenerDestroyer[eventName]();
				delete registeredListener[eventName];
				delete eventListenerDestroyer[eventName];
			}
			*/
		}};
		return destroyer;
	}
	function sendFragmentedEvents(structuredEventName, customEventDetail) {
		/*
		const fragments = eventSplitter(structuredEventName);
		fragments.forEach( (eventPart)=>{
			if(Array.isArray(registeredListener[eventPart])){
				registeredListener[eventPart] = registeredListener[eventPart].filter( (e)=>!!e );
				for(let i =0; i<registeredListener[eventPart].length; ++i){
					//console.log(registeredListener[eventPart][i].callback.toString());
					if(registeredListener[eventPart][i]) registeredListener[eventPart][i].callback({'detail': customEventDetail});
					if(!registeredListener[eventPart]) break;
				}
			}
		});
		*/
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
