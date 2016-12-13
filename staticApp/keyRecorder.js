define([], () => {
	'use strict';
	function KeyRecorder(inertStruct) {
		const handler = {
			'get': (struct,key)=>{
				if(!struct.hasOwnProperty(key)){
					// send some event ?
					struct[key] = '';
				}
				return struct[key];
			}
		};
		this.smartObj = new Proxy(inertStruct, handler);
		return this.smartObj;
	}
	return {KeyRecorder}
});
