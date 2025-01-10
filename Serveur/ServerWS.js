import mongoose from 'mongoose';
import http from 'http';
import {server as WebSocketServer} from 'websocket';
import {initialiserPlateau} from '../TP2/www/js/plateau.js';


const server = http.createServer();
// === Démarrer les serveurs ===
const PORT = 9898;
server.listen(9898);
(async () => {
  await initDB();
  server.listen(PORT, () => {
    console.log(`Serveur lancé et en écoute sur http://localhost:${PORT}`);
  });
});
const MONGO_URI = 'mongodb://127.0.0.1:27017/DameDataBase';

// Connexion MongoDB
const initDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB :', error);
    process.exit(1);
  }
};
initDB();

// === Définir les schémas existants ===
// Collection User
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, 
  victory: Number,
  loss : Number,
});
const User = mongoose.model('User', UserSchema, 'User');

// === Serveur Express pour les API REST ===
//const app = express();
//app.use(express.json());
//app.use(cors());

//Création du serveur WebSocket qui utilise le serveur précédent 

const wsServer = new WebSocketServer({
    httpServer: server
});

// Joueurs
const connectedPlayers = [];
const waitingPlayers = [];
const games = {}; // Stockage des parties

  // // Fonction pour démarrer une partie
function startGame(player1, player2) {
  const gameId = Math.random().toString(36).substring(2, 9);
  games[gameId] = { players: [player1, player2], board: initialiserPlateau() };

  if (player1.connection && player2.connection) {
      player1.connection.send(JSON.stringify({ type: 'start', gameId, color: 'white', opponent: player2.username || 'Adversaire' }));
      player2.connection.send(JSON.stringify({ type: 'start', gameId, color: 'black', opponent: player1.username || 'Adversaire' }));
  } else {
      console.error('Une des connexions est invalide.');
  }
    
  console.log(`Partie ${gameId} commencée: ${player1.username || 'Joueur 1'} vs ${player2.username || 'Joueur 2'}`);
}

// On vérifie qu'il y a bien 2 joueurs au moins en file d'attente avant de démarrer les parties
const checkPlayersStartGames = () => {
  while (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();

      console.log("Type de player1:", typeof player1);
      console.log("Type de player2:", typeof player2);
      
      if (!player1 || !player2.connection) {
          console.error('Erreur : joueurs invalides pour démarrer une partie.');
          return;
      }
      
      startGame(player1, player2);
  }
};

wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  console.log('Nouveau client connecté via WebSocket');
  waitingPlayers.push(connection);
  console.log(waitingPlayers.length);
  //console.log(waitingPlayers);

  if (waitingPlayers.length >= 3) {
    const player1 = { connection: waitingPlayers.shift() };
    const player2 = { connection: waitingPlayers.shift() };
    
    const gameId = Math.random().toString(36).substring(2, 9);
    games[gameId] = { player1, player2, board: initialiserPlateau() };
    console.log("Type de player1:", typeof player1);
    console.log("Type de player2:", typeof player2);
    //console.log("player1:", player1);
    //console.log("player2:", player2);

    player1.connection.sendUTF(JSON.stringify({ type: 'start', gameId, player: 'X' }));
    player2.connection.sendUTF(JSON.stringify({ type: 'start', gameId, player: 'O' }));
    console.log(`Partie démarrée avec l'ID ${gameId}`);

  }
  // Gestion des messages WebSocket
  connection.on('message', async (message) => {
    
    const data = JSON.parse(message.utf8Data);
    console.log('Données reçues du client :', data);
    if (!data.type) {
      console.error('Type de message manquant');
      return;
    }
    // === Gestion de la connexion ===
    if (data.type === 'login') {
      const { username, password } = data;

      try {
        console.log(`Étape 1 : Vérification de l'utilisateur - username: "${username}"`);

        // Recherche dans MongoDB
        const user = await User.findOne({ username: username });

        if (user) {
          console.log('Étape 1 : Utilisateur trouvé :', user);
          if (password === user.password) {
            console.log('Étape 2 : Mot de passe correct');
            connection.sendUTF(JSON.stringify({
              type: 'login_success',
              message: 'Connexion réussie',
              username: user.username,
            }));
          } else {
            console.log('Étape 2 : Mot de passe incorrect');
            connection.sendUTF(JSON.stringify({
              type: 'login_error',
              message: 'Nom d\'utilisateur ou mot de passe incorrect.',
            }));
          }
        } else {
          console.log('Étape 1 : Aucun utilisateur trouvé avec ce nom d\'utilisateur, création d\'un nouvel utilisateur');
          try {
            const newUser = new User({
              username,
              email: '', // Remplir ou laisser vide si pas nécessaire pour le moment
              password, // Idéalement, hachez le mot de passe avant de le sauvegarder
              victory: 0,
              loss: 0,
            });
        
            await newUser.save();
        
            console.log('Nouvel utilisateur ajouté avec succès :', newUser);
        
            connection.sendUTF(JSON.stringify({
              type: 'login_success',
              message: 'Nouvel utilisateur créé avec succès et connexion réussie.',
              username: newUser.username,
            }));
          } catch (saveError) {
            console.error('Erreur lors de l\'ajout du nouvel utilisateur :', saveError);
            connection.sendUTF(JSON.stringify({
              type: 'error',
              message: 'Erreur serveur lors de la création d\'un nouvel utilisateur.',
            }));
          }
        }
      }
      catch (error) {
        console.error('Erreur serveur lors de la vérification de l\'utilisateur :', error);
        connection.sendUTF(JSON.stringify({
          type: 'error',
          message: 'Erreur serveur lors de la connexion.',
        }));
      }
    }
    //connexion du joueur, insertion dans la file d'attente 
    if (data.type === 'join_game') {
      waitingPlayers.push({ username: data.username, connection });
      checkPlayersStartGames();
      //console.log(waitingPlayers);
      return;
    }

    // === Gestion d'un déplacement ===
    if (data.type === 'move') {
      console.log('Déplacement reçu:', JSON.stringify(data, null, 2));
      
      if (!data.gameId || !games[data.gameId]) {
          console.error('Aucune partie trouvée pour cet ID:', data.gameId);
          connection.sendUTF(JSON.stringify({ type: 'error', message: 'Partie introuvable.' }));
          return;
      }
      
      const game = games[data.gameId];
      
      if (!game.board) {
          console.error('Plateau introuvable pour la partie :', data.gameId);
          connection.sendUTF(JSON.stringify({ type: 'error', message: 'Plateau introuvable.' }));
          return;
      }
      
      console.log('Plateau avant mise à jour :', JSON.stringify(game.board, null, 2));
      
      // Mise à jour du plateau
      game.board = data.board;
      console.log('Plateau après mise à jour :', JSON.stringify(game.board, null, 2));
      
      const opponent = game.players.find(p => p.connection !== connection);
      if (opponent) {
          opponent.connection.send(JSON.stringify({ type: 'update', board: game.board }));
          console.log('Mise à jour envoyée à l\'adversaire.');
      }
      return;
    }
      
  });
  connection.on('close', () => {
    console.log('Client déconnecté');
  });
});

// Authentification
wsServer.on("connection", (ws) => {
    console.log("Client connected");
    
    wsServer.on("close", () => {
      console.log("Client disconnected");
    });
});   

