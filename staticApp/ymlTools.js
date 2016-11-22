define([
	'../node_modules/js-yaml/dist/js-yaml',
	'./structManipulation',
	'./smartEvents'
], (jsyaml, struct, ev) => {
	'use strict';
	const on = ev.on, send = ev.send;

	function loadMerge(sourcesFiles, callbackOrEvent) {
		eventAggregator('yml.ready',
			buildFunc_aggregateYmlOnFileName(buildFunc_isInWhiteList(sourcesFiles)),
			buildFunc_aggregateLengthTrigger(sourcesFiles.length),
			(ymlList) => ev.callbackOrEventSender(callbackOrEvent, struct.mergeInOrder(sourcesFiles, ymlList)));
		multiLoad(sourcesFiles);
	}

	function multiLoad(sourcesFiles) {
		for (let i in sourcesFiles) {
			load(sourcesFiles[i]);
		}
	}

	function load(filePath) {
		fetch(filePath)
			.then((response) => response.text())
			.then((text) => send('file.ready', {'filename': filePath, 'fileContent': text}));
	}

	on('file.ready', convert);
	function convert(fileLoadedEvent) {
		send('yml.ready', {
			'filename': fileLoadedEvent.filename,
			'yml': jsyaml.safeLoad(fileLoadedEvent.fileContent)
		});
	}

	function buildFunc_isInWhiteList(whiteList) { // application partielle
		return (anything) => whiteList.indexOf(anything) !== -1
	}

	function buildFunc_aggregateYmlOnFileName(condition) { // application partielle
		return (aggregator, event) => condition(event.filename) ? aggregator[event.filename] = event.yml : aggregator
	}

	function buildFunc_aggregateLengthTrigger(length) { // application partielle
		return (aggregator) => Object.keys(aggregator).length == length
	}

	function eventAggregator(eventTypeToListen, aggregationFunc, sendAggregateTriggerFunc, eventTypeToSendOrCallBack) {
		let aggregator = {};
		let listener = on(eventTypeToListen, function (e) {
			aggregationFunc(aggregator, e);
			if (sendAggregateTriggerFunc(aggregator)) {
				listener.destroy();
				ev.callbackOrEventSender(eventTypeToSendOrCallBack, aggregator);
			}
		});
	}

	return {
		loadMerge,
		load,
		multiLoad,
		convert,
		eventAggregator,
		buildFunc_aggregateLengthTrigger
	}
});
