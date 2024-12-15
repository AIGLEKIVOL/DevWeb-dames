function initialiserPlateau() {
    // Fonction pour initialiser un plateau de 8x8 avec alternance des couleurs
    const plateau = [];
    for (let i = 0; i < 8; i++) {
        const ligne = [];
        for (let j = 0; j < 8; j++) {
            // Case noire sur les cases impaires et blanches sur les paires
            if ((i + j) % 2 === 0) {
                ligne.push("blanc");
            } else {
                ligne.push("noir");
            }
        }
        plateau.push(ligne);
    }
    return plateau;
}

function afficherPlateau() {
    const plateau = initialiserPlateau();  // Initialisation du plateau
    const tableauHTML = document.getElementById("plateau");  // Trouver l'élément HTML où afficher le plateau
    
    y = 1;
    plateau.forEach((ligne,i) => {
        const ligneHTML = document.createElement("div");  // Créer une ligne
        ligneHTML.style.display = "flex";  // Les cases seront alignées horizontalement
        x = 1;
        ligne.forEach((caseType,j) => {
            const caseSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");  // Créer une case en SVG
            caseSVG.setAttribute("width", "50");
            caseSVG.setAttribute("height", "50");
            

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "50");
            rect.setAttribute("height", "50");
            rect.setAttribute("data-x",x);
            rect.setAttribute("data-y",y);

            // Remplir les cases en fonction de leur couleur
            if (caseType === "noir") {
                rect.setAttribute("fill", "brown");  // Couleur marron (code couleur marron)
            } else {
                rect.setAttribute("fill", "white");  // Case blanche
            }

            rect.setAttribute("stroke", "black");
            caseSVG.appendChild(rect);

            // Ajouter les pions en SVG sur les cases noires uniquement
            if (caseType === "noir") {
                if (i < 3) {
                    ajouterPionSVG(caseSVG, "black");  // Pions noirs sur les 3 premières lignes
                } else if (i > 4) {
                    ajouterPionSVG(caseSVG, "white");  // Pions blancs sur les 3 dernières lignes
                }
            }
            x++;
            ligneHTML.appendChild(caseSVG);  // Ajouter la case à la ligne
        });
        y++;
        tableauHTML.appendChild(ligneHTML);  // Ajouter la ligne au plateau
    });
}

function ajouterPionSVG(caseSVG, couleur) {
    const pion = document.createElementNS("http://www.w3.org/2000/svg", "circle");  // Créer un cercle pour le pion
    pion.setAttribute("cx", "25");  // Coordonnée X (centre)
    pion.setAttribute("cy", "25");  // Coordonnée Y (centre)
    pion.setAttribute("r", "20");   // Rayon du pion
    pion.setAttribute("fill", couleur);  // Couleur du pion (noir ou blanc)

    // Ajouter une bordure noire au pion
    pion.setAttribute("stroke", "black");
    pion.setAttribute("stroke-width", "2");

    caseSVG.appendChild(pion);  // Ajouter le pion à la case
}
// Fonction pour gérer les déplacements des pions
function deplacerPions(pionSelectionne, caseArrivee) {
    const xDepart = parseInt(pionSelectionne.parentNode.querySelector("rect").getAttribute("data-x"));
    const yDepart = parseInt(pionSelectionne.parentNode.querySelector("rect").getAttribute("data-y"));
    const rectArrivee = caseArrivee.querySelector("rect");
    const xArrivee = parseInt(rectArrivee.getAttribute("data-x"));
    const yArrivee = parseInt(rectArrivee.getAttribute("data-y"));

    // Vérifier que la case d'arrivée est noire
    const couleurCaseArrivee = rectArrivee.getAttribute("fill");
    if (couleurCaseArrivee !== "brown") {
        console.error("Vous ne pouvez déplacer un pion que sur une case noire.");
        return false;
    }

    // Calculer la direction et la distance
    const deltaX = xArrivee - xDepart;
    const deltaY = yArrivee - yDepart;
    const couleurPion = pionSelectionne.getAttribute("fill");

    // Vérifier le sens du mouvement (les blancs montent, les noirs descendent)
    if ((couleurPion === "white" && deltaY >= 0) || (couleurPion === "black" && deltaY <= 0)) {
        console.error("Vous ne pouvez déplacer un pion que vers l'avant.");
        return false;
    }

    // Déplacement simple (1 case)
    if (Math.abs(deltaX) === 1) {
        // Déplacer le pion
        caseArrivee.appendChild(pionSelectionne);
        console.log("Déplacement réussi.");
        return true;
    }

    // Déplacement avec capture (2 cases)
    if (Math.abs(deltaX) === 2) {
        const xCapture = xDepart + deltaX / 2;
        const yCapture = yDepart + deltaY / 2;

        const caseCapture = document.querySelector(
            `rect[data-x="${xCapture}"][data-y="${yCapture}"]`
        ).parentNode;
        const pionCapture = caseCapture.querySelector("circle");

        if (pionCapture && pionCapture.getAttribute("fill") !== couleurPion) {
            // Supprimer le pion capturé
            caseCapture.removeChild(pionCapture);
            // Déplacer le pion
            caseArrivee.appendChild(pionSelectionne);
            console.log("Capture réussie.");
            return true;
        } else {
            console.error("Aucun pion ennemi à capturer.");
            return false;
        }
    }
    console.error("Déplacement invalide.");
    return false;
}

let joueurActif = "white";  // Les blancs commencent
let pionSelectionne = null;

document.getElementById("plateau").addEventListener("click", (event) => {
    const cible = event.target;

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

        // Essayer de déplacer le pion
        const deplacementValide = deplacerPions(pionSelectionne, caseArrivee);

        if (deplacementValide) {
            // Si le déplacement est valide, alterner le joueur actif
            joueurActif = joueurActif === "white" ? "black" : "white";
            console.log(`C'est au tour des ${joueurActif}.`);
        } else {
            // Si le déplacement est invalide, le joueur reste actif et peut réessayer
            console.log(`Le joueur ${joueurActif} doit réessayer.`);
        }
        pionSelectionne = null;
    }
});

afficherPlateau();  // Appel de la fonction pour afficher le plateau