# DevWeb-dames

Comment lancer tout le projet : 
1. se placer dans cmd (pas en mode admin)
se placer dans le répertoire suivant : DevWeb-dames et faire conda activate DevWeb (ou votre nom d'env pour le projet)
faire .\LaunchCordova.bat 


un autre terminal en même temps (se placer dans dossier Serveur du projet ) :
conda activate DevWeb
node Nom_Server.js (ex: node ServerWS.js)

autre terminal (se placer dans dossier TP2 du projet): 
conda activate DevWeb
cordova run browser 


Restauration de la base de données
Vérifiez que MongoDB est bien installé et en cours d'exécution
 Exécutez la commande suivante pour effectuer la restauration :
 mongorestore --db DameDataBase ./backup/DameDataBase
