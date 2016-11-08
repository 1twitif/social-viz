requirejs(['//d3js.org/d3.v4.min.js', //'node_modules/d3/build/d3.min.js'
		'//cdnjs.cloudflare.com/ajax/libs/js-yaml/3.6.1/js-yaml.min.js',
		'eventShortcut',
		'fps',
		'jsonUrlHashPersistance',
		'configLoader',
		'languageLoader',
		'graph',
		'userInterface'
	],
	function (d3, jsyaml) {
		requirejs(['jsonUrlHashPersistance'],() =>
			requirejs(['configLoader'],() =>
				requirejs(['languageLoader'],() =>
					requirejs(['graph'],() =>
						requirejs(['userInterface'],function(){console.log('chargement terminé');}
		)))))
	});

