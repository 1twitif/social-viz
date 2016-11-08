// loader
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

// options stuff
on('optionsChanged', saveOptions);
function saveOptions(opt){url.save(opt);}

// TODO : utiliser un Proxy pour déclancher les evenement OptionsChanged https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Proxy
