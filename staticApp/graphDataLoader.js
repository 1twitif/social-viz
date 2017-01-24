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
				localStore = new Store.LocalStore(inertData, 'graph.data');
				inertData = struct.merge(inertData, localStore.load());
				send('graph.data.ready', new mStruct.MonitoredStruct(inertData, 'graph.data'));
			}
		});
		ymlTools.load('allData/publicData.yml');
	}

	function listenerInit() {
		on('graph.data ready', setData);
		on('graph.data change', (data) => localStore.save(data));
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
