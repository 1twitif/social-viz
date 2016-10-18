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
