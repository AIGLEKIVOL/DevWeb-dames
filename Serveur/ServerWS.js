import mongoose from 'mongoose';
import http from 'http';
import {server as WebSocketServer} from 'websocket';

const server = http.createServer();
server.listen(9898); // On écoute sur le port 9898

const users = new Map(); //simule une base de données

const MONGO_URI = 'mongodb://127.0.0.1/databaseJeuDb';

// Fonction pour initialiser la connexion
const initDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connexion à MongoDB réussie');
        return true;
    } catch (error) {
        console.error('Erreur de connexion à MongoDB', error);
        return false;
    }
};
initDB();

//Création du serveur WebSocket qui utilise le serveur précédent 

const wsServer = new WebSocketServer({
    httpServer: server
});

//Mise en place des événements WebSockets
wsServer.on('request', function(request){
    const connection = request.accept(null, request.origin);

    // Ecrire ici le code qui indique ce que l'on fait en cas de
    // réception de message et en cas de fermeture de la WebSocket
    connection.on('open', function(message) {
        console.log('Bienvenue ! Vous êtes connecté');
        });
        
    connection.on('message', function(message) {
        console.log(message, 'bien reçu');
        const raw = JSON.stringify(message)
        const dataraw = JSON.parse(raw);
        const data = JSON.parse(dataraw.utf8Data);

        console.log(data.username);

        //if (data.type === "login") {
          const { username, password } = data;
    
          if (users.has(username)) {
            // Vérifier le mot de passe pour un utilisateur existant
            if (users.get(username) === password) {
              connection.send(
                JSON.stringify({
                  type: "login_success",
                  username,
                })
              );
            } else {
              connection.send(
                JSON.stringify({
                  type: "login_error",
                  message: "Mot de passe incorrect.",
                })
              );
            }
          } else {
            // Ajouter un nouvel utilisateur
            users.set(data.username, data.password);
            connection.send(
              JSON.stringify({
                type: "login_success",
                username,
              })
            );
          }
        //};
        console.log(users);

    });
    connection.on('close', function(reasonCode, description) {
        console.log('perte de connexion')
        // To do
        });
});

// Authentification
wsServer.on("connection", (ws) => {
    console.log("Client connected");
  
    
    wsServer.on("close", () => {
      console.log("Client disconnected");
    });
  });

  // Liste des joueurs connectés
 const connectedPlayers = [];

  
  // Liste d'attente des joueurs
  const waitingPlayers = [];


    