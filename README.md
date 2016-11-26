[![Coverage Status](https://coveralls.io/repos/github/1twitif/social-viz/badge.svg?branch=master)](https://coveralls.io/github/1twitif/social-viz?branch=master)
[![Code Climate](https://codeclimate.com/github/1twitif/social-viz/badges/gpa.svg)](https://codeclimate.com/github/1twitif/social-viz)
[![bitHound Overall Score](https://www.bithound.io/github/1twitif/social-viz/badges/score.svg)](https://www.bithound.io/github/1twitif/social-viz)
[![license](https://img.shields.io/github/license/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/blob/master/LICENSE)

# Social-viz
Visualisation de graph sociaux

## [Démo en ligne](https://1twitif.github.io/social-viz/)

## Suivi qualité

#### Santé du code

[![Code Climate](https://codeclimate.com/github/1twitif/social-viz/badges/gpa.svg)](https://codeclimate.com/github/1twitif/social-viz)
[![Coverage Status](https://coveralls.io/repos/github/1twitif/social-viz/badge.svg?branch=master)](https://coveralls.io/github/1twitif/social-viz?branch=master)

[![Build Status](https://travis-ci.org/1twitif/social-viz.svg?branch=master)](https://travis-ci.org/1twitif/social-viz)
[![Docker Automated build](https://img.shields.io/docker/automated/1twitif/social-viz.svg)](https://hub.docker.com/r/1twitif/social-viz/)

[![Known Vulnerabilities](https://snyk.io/test/github/1twitif/social-viz/badge.svg)](https://snyk.io/test/github/1twitif/social-viz/)

[![Issue Count](https://codeclimate.com/github/1twitif/social-viz/badges/issue_count.svg)](https://codeclimate.com/github/1twitif/social-viz)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/34309e41bb63406cae117f68e1a41d72)](https://www.codacy.com/app/github_97/social-viz)

[![bitHound Overall Score](https://www.bithound.io/github/1twitif/social-viz/badges/score.svg)](https://www.bithound.io/github/1twitif/social-viz)
[![bitHound Code](https://www.bithound.io/github/1twitif/social-viz/badges/code.svg)](https://www.bithound.io/github/1twitif/social-viz)

[![bitHound Dependencies](https://www.bithound.io/github/1twitif/social-viz/badges/dependencies.svg)](https://www.bithound.io/github/1twitif/social-viz/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/1twitif/social-viz/badges/devDependencies.svg)](https://www.bithound.io/github/1twitif/social-viz/master/dependencies/npm)

#### Dynamisme du projet

[![Issue Stats](https://img.shields.io/issuestats/i/github/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/issues)
[![Pull Stats](https://img.shields.io/issuestats/p/github/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/pulls)

[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/1twitif/social-viz.svg)](http://isitmaintained.com/project/1twitif/social-viz "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/1twitif/social-viz.svg)](http://isitmaintained.com/project/1twitif/social-viz "Percentage of issues still open")

[![Issues Open](https://img.shields.io/github/issues/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/issues)
[![Pull Request](https://img.shields.io/github/issues-pr/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/pulls)

[![Commits count](https://img.shields.io/github/commits-since/1twitif/social-viz/start.svg)](https://github.com/1twitif/social-viz/graphs/commit-activity)

[![dependencies Status](https://david-dm.org/1twitif/social-viz/status.svg)](https://david-dm.org/1twitif/social-viz)
[![devDependencies Status](https://david-dm.org/1twitif/social-viz/dev-status.svg)](https://david-dm.org/1twitif/social-viz?type=dev)

#### Santé communautaire
 
[![Contributors](https://img.shields.io/github/contributors/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/graphs/contributors)
[![GitHub forks](https://img.shields.io/github/forks/1twitif/social-viz.svg)](https://github.com/1twitif/social-viz/network)

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
