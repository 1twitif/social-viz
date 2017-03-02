const express = require('express');
const app = express();

app.use(express.static('./'));

/*app.get('/', function (req, res) {
 	res.send('Hello World!')
})*/

app.listen(3000, function () {
	console.log('Version local utilisable ici : http://localhost:3000/');
	try{
		require("openurl").open("http://localhost:3000/");
	} catch(e){
		console.log("openurl non disponnible");
	}
});
