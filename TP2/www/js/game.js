import {deplacerPions, capturePossible, afficherPlateau} from './plateau.js';

afficherPlateau();  // Appel de la fonction pour afficher le plateau
let joueurActif = "white";  // Les blancs commencent
let pionSelectionne = null;

document.getElementById("plateau").addEventListener("click", (event) => {
    const socket = new WebSocket("ws://127.0.0.1:9898/");
    const cible = event.target;
    const x = cible.getAttribute("data-x");
    const y = cible.getAttribute("data-y");
    const couleurPion = cible.getAttribute("fill");

    if (cible.tagName === "circle") {
        const couleurPion = cible.getAttribute("fill");
        

        // Vérifier si c'est bien le tour du joueur
        if (couleurPion !== joueurActif) {
            console.error(`Ce n'est pas le tour des ${couleurPion}.`);
            return;
        }
        pionSelectionne = cible;
        console.log(`Pion ${couleurPion} sélectionné.`);
    } else if (cible.tagName === "rect" && pionSelectionne) {
        const caseArrivee = cible.parentNode;
        const xCible = caseArrivee.getAttribute("data-x");
        const yCible = caseArrivee.getAttribute("data-y");        
        // Essayer de déplacer le pion
        const deplacementValide = deplacerPions(pionSelectionne, caseArrivee);

        if (deplacementValide) {
            pionSelectionne = cible;
            // Le joueur reste actif si des captures successives sont possibles, sinon on alterne
            if (capturePossible(xCible,yCible,couleurPion)) {
                console.log("Vous pouvez continuer à capturer !");
                console.log(`C'est au tour des ${joueurActif}.`);
            }
            // Si le déplacement est valide, alterner le joueur actif
            else {
                joueurActif = joueurActif === "white" ? "black" : "white";
                console.log(`C'est au tour des ${joueurActif}.`);
            }
        } else {
            // Si le déplacement est invalide, le joueur reste actif et peut réessayer
            console.log(`Le joueur ${joueurActif} doit réessayer.`);
        }
        pionSelectionne = null;
    }
});
