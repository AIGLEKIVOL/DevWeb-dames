import mongoose from 'mongoose';
import http from 'http';
import {server as WebSocketServer} from 'websocket';

const server = http.createServer();
//server.listen(9898); // On écoute sur le port 9898

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

  // // Fonction pour démarrer une partie
  // const startGame = (player1, player2) => {
  //   console.log(`Starting game between ${player1.username} and ${player2.username}`);
  //   player1.connection.send(JSON.stringify({ type: 'game_start', opponent: player2.username }));
  //   player2.connection.send(JSON.stringify({ type: 'game_start', opponent: player1.username }));
  //   // Logique de démarrage du jeu ici
  // };

// On vérifie qu'il y a bien 2 joueurs au moins en file d'attente avant de démarrer les parties
const checkPlayersStartGames = () => {
  while (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();
      startGame(player1, player2);
  }
};

wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  console.log('Nouveau client connecté via WebSocket');

  // Gestion des messages WebSocket
  connection.on('message', async (message) => {
    const data = JSON.parse(message.utf8Data);

    console.log('Données reçues du client :', data);

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
        
    }  catch (error) {
      console.error('Erreur serveur lors de la vérification de l\'utilisateur :', error);
      connection.sendUTF(JSON.stringify({
        type: 'error',
        message: 'Erreur serveur lors de la connexion.',
      }));
    }
  };
// Ajout du joueur à la liste des joueurs connectés et à la file d'attente
const player = {username, connection};
connectedPlayers.push(player);
waitingPlayers.push(player);

// Vérifie si on peut démarrer une ou des partie(s)
checkPlayersStartGames();

//On informe les joeurs quand ils sont dans la file d'attente
if (waitingPlayers.includes(player)) {
    connection.send(JSON.stringify({ 
      type: 'waiting',
      message: 'En attente d\'un adversaire'
    })
  );
}
  connection.on('close', () => {
    console.log('Client déconnecté');
  });
})});

// Authentification
wsServer.on("connection", (ws) => {
    console.log("Client connected");
    
    wsServer.on("close", () => {
      console.log("Client disconnected");
    });
});   

// === Démarrer les serveurs ===
const PORT = 9898;

(async () => {
  await initDB();
  server.listen(PORT, () => {
    console.log(`Serveur lancé et en écoute sur http://localhost:${PORT}`);
  });
})();