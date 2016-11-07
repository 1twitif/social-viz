if (typeof exports === 'undefined') var exports = {};
function send(eventName,eventData){
	dispatchEvent(new CustomEvent(eventName, {'detail':eventData}));
}
exports.send = send;
function on(eventName,callback){
	addEventListener(eventName,function(e){
		callback(e.detail);
	});
}
exports.on = on;
