[![Code Climate](https://codeclimate.com/github/1twitif/social-viz/badges/gpa.svg)](https://codeclimate.com/github/1twitif/social-viz)
[![Coverage](https://img.shields.io/badge/coverage-23-red.svg)](https://1twitif.github.io/social-viz/coverage/Firefox%2049.0.0%20(Windows%207%200.0.0)/lcov-report/staticApp/index.html)



# Social-viz
Visualisation de graph sociaux

## [Démo en ligne](https://1twitif.github.io/social-viz/)

## Usage basique (sans authentification ni édition des données)

- Télécharger le projet
- Remplacer le contenu du dossier `allData` par vos données et configuration
- Héberger le résultat ou vous voulez

### Usage hors ligne (sans authentification ni édition des données)

Remplacez la dernière étape de l'usage basique par ce qui suit :

- Télécharger `https://d3js.org/d3.v4.min.js` et placer le dans le dossier du projet.
- Télécharger `https://caddyserver.com/download` et placer le dans le dossier du projet (ou utiliser xampp ou autre serveur web).
- Lancez le serveur `caddy` et consultez le site à [l'adresse indiqué](http://localhost:2015/) avec un navigateur moderne.

## Installation complète

prérequis : node.js, git

```sh
npm install
npm start
```

## Hébergement avec docker

```bash
docker-compose up
```

## Structure des données :
Chaque noeud doit avoir un libellé et un type. Il peut contenir d'autres champs optionnels.
```json
{"nodes":[
	{"label":"John Smith","type":"agent"},
	{"label":"M. Dupont","type":"avocat","dateBirth":"1970-01-01","comment":"# M. Dupont\n ## Sa vie\n ## Son oeuvre\ ..."}
]
}
```
Dans la configuration, chaque type devra être associé à un calque ou sous calque pour renseigner la légende et son style d'affichage.
```json
{"nodeLayers":[
	{"id":"human","label":"Personne physique","color":"#AA3388","picto":"staticApp/appImg/people.svg",
	"subLayers":[
		{"id":"agent","label":"Agent","picto":"staticApp/appImg/people.svg"},
		{"id":"juridique","label":"Professionnel de la loi","picto":"staticApp/appImg/people.svg",
		"subLayres":[
			{"id":"avocat","label":"Avocat","picto":"staticApp/appImg/people.svg"}
		]}
	]}
]
}
```
