const http = require('http');
const server = http.createServer();
server.listen(9898); // On écoute sur le port 9898

//Création du serveur WebSocket qui utilise le serveur précédent 
const WebSocketServer = require('websocket').server;
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
        });
    connection.on('close', function(reasonCode, description) {
        console.log('perte de connexion')
        // To do
        });
});
    