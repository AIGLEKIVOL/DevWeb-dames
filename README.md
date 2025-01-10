# DevWeb-dames

Après avoir créer votre environnement conda et avoir fait les installations nécessaires pour cordova, il faudra : 
1. Se placer dans le terminal (pas en mode admin)
- se placer dans le répertoire suivant : DevWeb-dames
- faire conda activate NomEnvConda (votre nom d'env pour le projet)
- lancer cordova :
    [version windows] .\LaunchCordova.bat
    [version linux] ./LaunchCordova.sh

2. Restauration de la base de données
Vérifiez que MongoDB est bien installé et en cours d'exécution
 Exécutez la commande suivante pour effectuer la restauration :
 mongorestore --db DameDataBase ./backup/DameDataBase

3. un autre terminal en même temps (se placer dans dossier Serveur du projet ) :
- conda activate DevWeb
- node ServerWS.js

4. dans un autre terminal (se placer dans dossier TP2 du projet): 
- conda activate NomEnvConda
- cordova run browser 
