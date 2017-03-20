const express = require('express');
const http = require('http');
const app = express();

const srv = http.createServer(app).listen();

app.use(express.static('./'));

app.listen(0, function () {
	console.log('Version local utilisable ici : http://localhost:'+srv.address().port+'/');
	try{
		require("openurl").open("http://localhost:"+srv.address().port+"/");
	} catch(e){
		console.log("openurl non disponnible");
	}
});
