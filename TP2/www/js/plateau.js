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

    plateau.forEach((ligne) => {
        const ligneHTML = document.createElement("div");  // Créer une ligne
        ligneHTML.style.display = "flex";  // Les cases seront alignées horizontalement

        ligne.forEach((caseType) => {
            const caseDiv = document.createElementNS("http://www.w3.org/2000/svg", "svg");  // Créer une case
            caseDiv.style.width = "50px";
            caseDiv.style.height = "50px";
            caseDiv.style.backgroundColor = caseType === "noir" ? "brown" : "white";  // Définir la couleur de la case
            caseDiv.style.border = "1px solid #000";  // Bordure autour de la case
            ligneHTML.appendChild(caseDiv);  // Ajouter la case à la ligne
        });

        tableauHTML.appendChild(ligneHTML);  // Ajouter la ligne au plateau
    });
}

afficherPlateau();  // Appel de la fonction pour afficher le plateau
