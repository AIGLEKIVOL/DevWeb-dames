function initialiserPlateau() {
    // Fonction pour initialiser un plateau de 8x8 avec alternance des couleurs
    const plateau = [];
    for (let i = 0; i < 10; i++) {
        const ligne = [];
        for (let j = 0; j < 10; j++) {
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

    plateau.forEach((ligne,i) => {
        const ligneHTML = document.createElement("div");  // Créer une ligne
        ligneHTML.style.display = "flex";  // Les cases seront alignées horizontalement

        ligne.forEach((caseType,j) => {
            const caseSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");  // Créer une case en SVG
            caseSVG.setAttribute("width", "50");
            caseSVG.setAttribute("height", "50");

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "50");
            rect.setAttribute("height", "50");

            // Ajout des attributs de position
            rect.setAttribute("data-x", j); // Coordonnée X
            rect.setAttribute("data-y", i); // Coordonnée Y

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
                if (i < 4) {
                    ajouterPionSVG(caseSVG, "black");  // Pions noirs sur les 3 premières lignes
                } else if (i > 5) {
                    ajouterPionSVG(caseSVG, "white");  // Pions blancs sur les 3 dernières lignes
                }
            }

            ligneHTML.appendChild(caseSVG);  // Ajouter la case à la ligne
        });

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


afficherPlateau();  // Appel de la fonction pour afficher le plateau

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

    // Déplacement simple (1 case)
    if (Math.abs(deltaX) === 1) {
    // Vérifier le sens du mouvement (les blancs montent, les noirs descendent)
        if ((couleurPion === "white" && deltaY >= 0) || (couleurPion === "black" && deltaY <= 0)) {
            console.error("Vous ne pouvez déplacer un pion que vers l'avant.");
            return false;
        }
            // Déplacer le pion
            caseArrivee.appendChild(pionSelectionne);
            console.log("Déplacement réussi.");
            return true;
    }
    

    // Déplacement avec capture (2 cases)
    if (Math.abs(deltaX) === 2 && Math.abs(deltaY) === 2) {
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
            // Vérifier s'il y a une capture  possible
            if (capturePossible(xArrivee,yArrivee, couleurPion)) {
                // Si des captures successives sont possibles, continuer avec ce pion
                //console.log("Vous pouvez continuer à capturer !");
                joueurActif = joueurActif === "white" ? "black" : "white";
                return true;  // Retourne vrai pour permettre une capture successive
            }

            // Si aucune capture successive, c'est au tour de l'autre joueur
            return true;
        } else {
            console.error("Aucun pion ennemi à capturer.");
            return false;
        }
    }

    console.error("Déplacement invalide.");
    return false;
}

// Vérification si capture possible 
function capturePossible(xDepart, yDepart, couleurPion) {
    const directions = [
        { x: 2, y: 2 }, { x: -2, y: 2 },
        { x: 2, y: -2 }, { x: -2, y: -2 }
    ];

    for (const direction of directions) {
        const xArrivee = xDepart + direction.x;
        const yArrivee = yDepart + direction.y;
        
        const caseArrivee = document.querySelector(
            `rect[data-x="${xArrivee}"][data-y="${yArrivee}"]`
        )?.parentNode;
        //console.log(caseArrivee?.querySelector("circle"));
        //si la case d'arrivée contient un pion
        if(caseArrivee?.querySelector("circle")!==null){
           
        }
        else{
            rectArrivee = document.querySelector(
                `rect[data-x="${xArrivee}"][data-y="${yArrivee}"]`
            )
            // Vérifie que la case d'arrivée est vide (couleur "brown")
            if (rectArrivee.getAttribute("fill") === "brown") {
                const xCapture = xDepart + (direction.x / 2);
                const yCapture = yDepart + (direction.y / 2);

                const caseCapture = document.querySelector(
                    `rect[data-x="${xCapture}"][data-y="${yCapture}"]`
                )?.parentNode; // Vérifie si une case intermédiaire existe
                const pionCapture = caseCapture?.querySelector("circle");

                // Vérifie qu'il y a un pion à capturer et que ce pion n'est pas de la même couleur
                if (pionCapture && (pionCapture.getAttribute("fill") !== couleurPion)) {
                    return true; // Capture possible
                }
            }
        }
    }

    return false; // Aucune capture possible
}


let joueurActif = "white";  // Les blancs commencent
let pionSelectionne = null;

document.getElementById("plateau").addEventListener("click", (event) => {
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



