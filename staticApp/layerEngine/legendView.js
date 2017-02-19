/*
Légende suivi d'un +/- pour basculer entre les styles
- épuré / détaillé

épuré :
bordure gauche profondeur de sous calque,
img, titre, +
+ -> +/- de déploiement
jauge de % de sous calques affiché en bordure droite.
calque vide non affichés.
si tout masqué, opacité à 0.2 pour l'image et le +, 0.5 pour le titre
au survol, à la place du titre, intitulé détaillé en défilant.

détaillés:
bordure gauche profondeur de sous calque,
img et en L2 aligné à droite nombre d'éléments sélectionné par le calque, L1: titre L2: intitulé détaillé (défilant au survol), L1: checkbox, L2 : +/- de déploiement
checkbox coché si tout les fils le sont, décoché si aucun, indeterminate sinon. Au clique, coche tout ou décoche si cochée.
jauge de % de sous calques affiché en bordure droite.
si calque vide (ne sélectionne rien), opacité à 0.5 pour tout sauf le titre en 0.7
si tout masqué, opacité à 0.2 pour l'image et le +, 0.5 pour le titre
au survol, étendre la ligne au dela du conteneur pour afficher à droite : L1 : sousCalquesAffichés/sousCalquesTotaux et L2 entitésIncluesAffichées/entitésInclues
 */
