(()=> {
	const dependencies = [
		'../node_modules/js-yaml/dist/js-yaml',
		'./structManipulation',
		'./smartEvents'
	];
	const libEnv = function (jsyaml, struct, ev) {
		'use strict';
		const on = ev.on, send = ev.send;

		function loadMerge(sourcesFiles, callbackOrEvent) {
			eventAggregator('ymlReady',
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
				.then((text) => send('fileLoaded', {'filename': filePath, 'fileContent': text}));
		}

		on('fileLoaded', convert);
		function convert(fileLoadedEvent) {
			send('ymlReady', {
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
	};
	if (typeof module !== 'undefined' && typeof require !== 'undefined'){
		module.exports = libEnv.apply(this, dependencies.map(require));
		module.exports.mockable = libEnv; // module loader with mockable dependencies
	}
	// AMD
	if (typeof define !== 'undefined') define(dependencies, libEnv);
})();
