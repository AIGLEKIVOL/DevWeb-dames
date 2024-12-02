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