define([
	'../smartEvents'
], (ev) => {
	function init(){
		const toConvert = ["layers","nodeSizingModes","linkSizingModes"];
		let used = false;
		ev.on("config.pre-ready", (preConfig)=>{
			used = true;
			for(let item of toConvert){
				if(!preConfig.hasOwnProperty(item)) preConfig[item] = [];
				preConfig[item] = parseCriteria(preConfig[item]);
			}
		});
		setTimeout(()=>{
			if(!used) ev.send('plugin.configParser.err', {
				'type': 'plugin.configParser.err',
				'value': 'configParse have never catch config.pre-ready. configLoader have probably finish before configParser start.'
			});
		},10000);
	}
	function parseCriteria(criteria) {
		for(let i = 0; i< criteria.length;i++) criteria[i] = parseCriterionTree(criteria[i]);
		return criteria;
	}

function parseCriterionTree(criterion) { //FIXME: duplication avec __parseEntry dans form.js
	if(criterion.name) return criterion;

	for (let unicKey in criterion) {
		if(Array.isArray(criterion[unicKey])) return {name:unicKey,subCriteria:appendPrefix(unicKey,criterion[unicKey])};
		return {name:unicKey,criterion:criterion[unicKey]};
	}
}
function appendPrefix(prefix,criteria){
	const res = [];
	for(let criterion of criteria){
		criterion = parseCriterionTree(criterion);
		criterion.name = prefix+'_'+criterion.name;
		if(criterion.subCriteria) criterion.subCriteria = appendPrefix(prefix,criterion.subCriteria);
		res.push(criterion);
	}
	return res;
}

	return {init,parseCriteria};
});
