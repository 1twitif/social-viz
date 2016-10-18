var appDefault,thisInstallationDefault,url,options;
d3.json("staticApp/appDefault.json", function(error, json){
	if(error) console.log(error);
	appDefault = json;
	window.dispatchEvent(new CustomEvent('configFileLoaded', {'detail':json}));
});
d3.json("allData/config.json", function(error, json){
	if(error) console.log(error);
	thisInstallationDefault = json;
	window.dispatchEvent(new CustomEvent('configFileLoaded', {'detail':json}));
});
window.addEventListener('configFileLoaded', function (e) {
	if(appDefault && thisInstallationDefault){
		thisInstallationDefault = merge(appDefault,thisInstallationDefault);
		// init url with default values
		url = new Url(thisInstallationDefault);
		// init options from url hash
		options = url.load();
		window.dispatchEvent(new CustomEvent('configReady', {'detail':options}));
	}
});
