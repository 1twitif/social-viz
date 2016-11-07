var url, options={};
asyncYmlLoader([
	"staticApp/appDefault.yml",
	"allData/config.yml"
], function(data){
	options = data;
	url = new Url(options);	// init url with default values
	options = url.load();	// init options from url hash
	send('configReady', options);
});
