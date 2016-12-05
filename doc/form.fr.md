# Guide d'édition de formulaire

Pour que l'application utilise le fichier de formulaire, il doit être placé et nomé comme suit :
`allData/form.yml`

## Gestion des langues
Toutes les données du fichier form.yml sont passées au moteur de traduction avant affichage.

Vous pouvez donc créer le formulaire dans la langue de votre choix
et consulter le [guide de traduction](doc/trad.fr.md) pour que vos formulaires puissent
être disponnible dans toutes les langues.

## Structure

Sans convertisseur, si l'on veut que l'application affiche le graphe correspondant aux saisies du formulaire,
celui-ci doit contenir les formulaires suivant: `node` et `link`.

Avec convertisseur, il est possible de créer autant de formulaires que souhaité,
tant que le convertisseur est capable de les transformer en `node` et `link`
pour l'affichage dans le reste de l'application.

### Premier niveau (sans indentation)

Liste les formulaires. (généralement node et link)

un mot clef spécifique peut être utilisé au premier niveau : `enum`

`enum` sert à stocker des listes statiques, nomées d'éléments,
qui pourront servir de propositions prédéterminées lors de la saisie.

### 2ème niveau (indenté par 2 espaces)

Sauf pour la cas particulier `enum` traité dans la partie [Syntaxes spécifiques](#Syntaxes spécifiques) :

Chaque élément au 2ème niveau doit être précédé d'un tiret et d'un espace en plus de l'indentation : `  - element`

Ces éléments constituent soit des champs du formulaire, soit des cas particuliers ( `if` présenté dans les [Mots clefs spécifiques](#Mots clefs spécifiques) ).

Les champs de formulaires peuvent être de simple champs de saisie classique, caractérisé par leur intitulé : `- intitulé`
soit des champs avec options en finissant leur intitulé par le caractère `:` comme suit : `- intitulé:`

Les options sont alors placé sans `- ` initial à un 3ème niveau d'indentation, à la suite de l'intitulé à option.
Les options de champs sont : `dataType`, `required`, `from`, `calculated`
Leur rôle est détaillé dan les [Mots clefs spécifiques](#Mots clefs spécifiques).

*Note: s'il n'y a que peux d'options, plutôt que de les mettre à la ligne avec un 3ème niveau d'indentation, il est possible de les écrire comme suit :*

`- intitulé: {option: valeur, option2: valeur2}`

## Mots clef spécifiques

### `dataType:`


### `if:`


### `from:`
### `required`
### `calculated:`


## Syntaxes spécifiques

### `enum`

Sert à stocker des listes statiques, nomées d'éléments,
qui pourront servir de propositions prédéterminées lors de la saisie.
Il est possible de faire autant de niveau d'indentation que souhaité (1 niveau d'indentation = 2 espaces).
On peut ainsi structurer ses listes d'éléments de façon arborescente. Par exemple :

```yaml
enum:
  basic:
    question:
      - qui ?
      - quand ?
    reponse:
      quand:
        - maintenant
        - plus tard
  avancé:
  	- un élément
  	- un autre
  	- un troisième
```
Pour accéder aux listes de cette exemple il faudra écrire :
`enum.basic.question`, ou `enum.basic.reponse.quand`, ou `enum.avancé` selon la liste souhaitée.

### (if) `condition:`

### `from:`

### `calculated:`

