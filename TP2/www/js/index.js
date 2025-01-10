/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

const ws = new WebSocket('ws://127.0.0.1:9898/');

let currentGameId = null; // L'ID de la partie en cours
let joueurActif = "white"; // Le joueur qui commence
let plateau = 

document.addEventListener('deviceready', onDeviceReady, false);
console.log('Connexion...')

ws.onopen = () => {
    const username = prompt("Entrez votre nom d'utilisateur:");
    ws.send(JSON.stringify({ action: 'login', username }));
    afficherPlateau(); // Construire le plateau sur la page
};
    
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'update') {
        const { from, to } = message.move;

        const pion = document.querySelector(
            `rect[data-x="${from.x}"][data-y="${from.y}"]`
        ).parentNode.querySelector("circle");
        const caseArrivee = document.querySelector(
            `rect[data-x="${to.x}"][data-y="${to.y}"]`
        ).parentNode;

        deplacerPions(pion, caseArrivee); // Applique le mouvement
    }
    if (message.type === 'start') {
        currentGameId = message.gameId;
        playerColor = message.color; // Stockez la couleur du joueur
        console.log(`La partie commence ! Vous jouez les ${playerColor}.`);
    }
    if (message.type === 'update') {
        mettreAJourPlateau(data.board);
    }
};

ws.onclose = () => console.log("Déconnecté du serveur WebSocket.");

ws.onerror = (error) => console.error("Erreur WebSocket:", error);


function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    //ws.send('premier bonjour');
}

function joinGame(gameId) {
    currentGameId = gameId;
    ws.send(JSON.stringify({ action: 'join', gameId }));
    console.log(`Rejoint la partie avec l'ID: ${gameId}`);
}

function mettreAJourPlateau(board) {
    console.log('Mise à jour du plateau:', board);
    const plateauHTML = document.getElementById("plateau");
    plateauHTML.innerHTML = "";
    
    board.forEach((ligne, i) => {
        const ligneHTML = document.createElement("div");
        ligneHTML.style.display = "flex";
        
        ligne.forEach((caseType, j) => {
            const caseHTML = document.createElement("div");
            caseHTML.style.width = "50px";
            caseHTML.style.height = "50px";
            caseHTML.style.border = "1px solid black";
            caseHTML.style.backgroundColor = caseType === "X" ? "red" : caseType === "O" ? "blue" : "white";
            caseHTML.addEventListener("click", () => jouerCoup(i, j));
            ligneHTML.appendChild(caseHTML);
        });
        
        plateauHTML.appendChild(ligneHTML);
    });
}

function jouerCoup(i, j) {
    if (!gameId) return;
    
    // Récupérer l'état actuel du plateau et modifier la case cliquée
    const board = Array.from(document.getElementById("plateau").children).map(ligne =>
        Array.from(ligne.children).map(cellule => cellule.style.backgroundColor === "red" ? "X" : cellule.style.backgroundColor === "blue" ? "O" : null)
    );
    
    if (!board[i][j]) {
        board[i][j] = playerSymbol;
        envoyerCoup(board);
    }
}

function envoyerCoup(board) {
    if (!gameId) return;
    socket.send(JSON.stringify({ type: 'move', gameId, board }));
}

function createGame() {
    const gameId = Math.random().toString(36).substring(2, 9);
    currentGameId = gameId;
    ws.send(JSON.stringify({ action: 'create', gameId }));
    console.log(`Partie créée avec l'ID: ${gameId}`);
}

// Gérer les messages reçus du serveur
function handleServerMessage(message) {
    if (message.type === 'update') {
        const { from, to } = message.move;
        const pion = document.querySelector(
            `rect[data-x="${from.x}"][data-y="${from.y}"]`
        ).parentNode.querySelector("circle");
        const caseArrivee = document.querySelector(
            `rect[data-x="${to.x}"][data-y="${to.y}"]`
        ).parentNode;

        // Appliquer le mouvement au plateau local
        deplacerPions(pion, caseArrivee);
    } else if (message.type === 'start') {
        currentGameId = message.gameId;
        console.log("La partie commence !");
    } else if (message.type === 'end') {
        console.log(`Partie terminée : ${message.result}`);
    }
}

// Gérer les clics sur le plateau
document.getElementById("plateau").addEventListener("click", (event) => {
    const cible = event.target;

    // Sélectionner un pion
    if (cible.tagName === "circle") {
        const couleurPion = cible.getAttribute("fill");
        if (couleurPion !== joueurActif) {
            console.error(`Ce n'est pas le tour des ${couleurPion}.`);
            return;
        }
        pionSelectionne = cible;
        console.log(`Pion ${couleurPion} sélectionné.`);
    } 
    // Déplacer un pion
    else if (cible.tagName === "rect" && pionSelectionne) {
        const caseArrivee = cible.parentNode;
        const deplacementValide = deplacerPions(pionSelectionne, caseArrivee);

        if (deplacementValide) {
            const xDepart = parseInt(pionSelectionne.parentNode.querySelector("rect").getAttribute("data-x"));
            const yDepart = parseInt(pionSelectionne.parentNode.querySelector("rect").getAttribute("data-y"));
            const xArrivee = parseInt(cible.getAttribute("data-x"));
            const yArrivee = parseInt(cible.getAttribute("data-y"));

            // Envoyer le mouvement au serveur
            sendMove({ x: xDepart, y: yDepart }, { x: xArrivee, y: yArrivee });

            // Alterner le joueur actif
            joueurActif = joueurActif === "white" ? "black" : "white";
            console.log(`C'est au tour des ${joueurActif}.`);
        }
        pionSelectionne = null;
    }
});



// Envoyer un mouvement au serveur
function sendMove(from, to) {
    if (!currentGameId) return;
    ws.send(JSON.stringify({
        type: 'move',
        move: { from, to },
        gameId: currentGameId, // ID de la partie en cours
    }));
    console.log(`Mouvement envoyé: ${from} -> ${to}`);
}

function showGameState(state) {
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = state;
}