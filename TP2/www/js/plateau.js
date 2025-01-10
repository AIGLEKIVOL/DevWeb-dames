const board = []; // Représentation interne du plateau
const currentGameId = 1;
const ws = new WebSocket('ws://127.0.0.1:9898/');

initializeBoard();

// Fonction pour initialiser le plateau
function initializeBoard() {
    // Parcourir chaque ligne et chaque colonne du plateau
    for (let i = 0; i < 11; i++) {
        const row = [];
        for (let j = 0; j < 11; j++) {
            if ((i + j) % 2 === 0) {
                // Cases blanches
                row.push(null);
            } else {
                // Cases noires
                if (i < 5) {
                    row.push('black'); // Pions noirs dans les 3 premières lignes
                } else if (i > 6) {
                    row.push('white'); // Pions blancs dans les 3 dernières lignes
                } else {
                    row.push(null); // Cases noires vides au milieu
                }
            }
        }
        board.push(row);
    }
    console.log("Plateau initialisé :");
    //console.table(board); // Affiche le plateau dans la console pour vérification
}



export function initialiserPlateau() {
    // Fonction pour initialiser un plateau de 10x10 avec alternance des couleurs
    const plateau = [];
    for (let i = 0; i < 11; i++) {
        const ligne = [];
        for (let j = 0; j < 11; j++) {
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

export function afficherPlateau() {
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

export function ajouterPionSVG(caseSVG, couleur) {
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



// Fonction pour mettre à jour le plateau en fonction d'un mouvement
// Fonction pour déplacer une pièce sur le plateau
function applyMove(from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    if (!isValidMove(from, to)) {
        console.error("Mouvement invalide !");
        return false;
    }

    // Déplacer la pièce
    const piece = board[fromRow][fromCol];
    board[fromRow][fromCol] = null;
    board[toRow][toCol] = piece;
}


function updateBoardUI(from, to, piece) {
    const fromElement = document.querySelector(`[data-position="${from}"]`);
    const toElement = document.querySelector(`[data-position="${to}"]`);
    if (fromElement) fromElement.textContent = ''; // Effacer la pièce
    if (toElement) toElement.textContent = piece;  // Ajouter la pièce
}

// Fonction pour gérer les déplacements des pions
export function deplacerPions(pionSelectionne, caseArrivee) {
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
            applyMove()
             // Envoyer le mouvement au serveur
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'move',
                    move: {
                        from: { x: xDepart, y: yDepart },
                        to: { x: xArrivee, y: yArrivee }
                    },
                    playerColor: couleurPion, // Optionnel : ajouter la couleur du joueur
                    gameId: currentGameId // ID de la partie actuelle
                }));
            } else {
                console.error("Connexion WebSocket fermée.");
            }
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
            // Envoyer le mouvement avec capture au serveur
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'move',
                    move: {
                        from: { x: xDepart, y: yDepart },
                        to: { x: xArrivee, y: yArrivee },
                        capture: { x: xCapture, y: yCapture } // Coordonnées du pion capturé
                    },
                    playerColor: couleurPion,
                    gameId: currentGameId
                }));
            } else {
                console.error("Connexion WebSocket fermée.");
            }

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
export function capturePossible(xDepart, yDepart, couleurPion) {
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
            const rectArrivee = document.querySelector(
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





