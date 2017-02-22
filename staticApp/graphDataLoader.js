define([
	'./smartEvents',
	'./ymlTools',
	'./MonitoredStruct',
	'./structManipulation',
	'./Store'
], (ev, ymlTools, mStruct, struct, Store) => {
	const on = ev.on, send = ev.send;

	let graphData;
	let localStore;

	function init() {
		listenerInit();
		on('yml.ready', (e) => {
			if (e.filename === 'allData/publicData.yml') {
				let inertData = e.yml;
				localStore = new Store.LocalStore(inertData, 'fullGraph');
				inertData = struct.merge(inertData, localStore.load());
				const fullGraph = new mStruct.MonitoredStruct(inertData, 'fullGraph');
				ev.give('fullGraph', fullGraph);
			}
		});
		ymlTools.load('allData/publicData.yml');
	}

	function listenerInit() {
		on('fullGraph ready', setData);
		on('fullGraph change', (data) => localStore.save(data));
		document.getElementById('exportData').addEventListener('click', exportData);

	}

	function setData(data) {
		graphData = data;
	}

	function getData() {
		return graphData;
	}

	function exportData() {
		ymlTools.exportAsFile('social-viz-data', getData());
	}

	return {init, getData}
});
