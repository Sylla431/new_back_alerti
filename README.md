# New Back Alerti

Ce projet est le nouveau back-end Node.js/Express de l'application Alerti.
L'objectif est de migrer progressivement l'ancien back-end Java Spring Boot et le service Python IA vers une API Node.js plus simple a maintenir.

Pour l'instant, ce projet contient la base technique:

- un serveur Express;
- une configuration par variables d'environnement;
- une route de verification de sante;
- une route de suivi de migration;
- une gestion d'erreurs en JSON;
- un client Supabase pret a utiliser.

## 1. Comprendre Node.js et Express

Node.js permet d'executer du JavaScript cote serveur.

Express est un framework Node.js qui permet de creer une API HTTP. Par exemple, une application mobile Flutter peut appeler:

```text
GET http://localhost:3000/api/health
```

Et Express renvoie une reponse JSON:

```json
{
  "success": true,
  "status": "ok"
}
```

## 2. Installation

Depuis le dossier du projet:

```bash
cd /Users/macpro/IdeaProjects/new_back_alerti
npm install
```

`npm install` installe toutes les dependances listees dans `package.json`.

## 3. Demarrer le serveur

```bash
npm start
```

Par defaut, le serveur demarre sur le port `3000`.

Tu peux ensuite tester dans le navigateur ou avec Postman:

```text
http://localhost:3000/
http://localhost:3000/api/health
http://localhost:3000/api/migration/status
```

## 4. Verifier la syntaxe

```bash
npm run check
```

Cette commande verifie que `app.js` et `bin/www` n'ont pas d'erreur de syntaxe JavaScript.

## 5. Les fichiers importants

### `package.json`

Ce fichier decrit le projet Node.js.

Il contient:

- le nom du projet;
- les scripts comme `npm start`;
- les dependances comme `express`, `cors`, `dotenv` et `@supabase/supabase-js`.

Exemple:

```json
"scripts": {
  "start": "node ./bin/www",
  "check": "node --check app.js && node --check ./bin/www"
}
```

### `app.js`

C'est le fichier principal de l'application Express.

Il fait plusieurs choses:

1. Charge les variables d'environnement avec `dotenv`.
2. Cree l'application Express.
3. Active les middlewares globaux.
4. Declare la route `/`.
5. Branche toutes les routes `/api`.
6. Active la gestion des erreurs.

Exemple important:

```js
app.use('/api', apiRouter);
```

Cela veut dire que toutes les routes definies dans `src/routes` commencent par `/api`.

### `bin/www`

Ce fichier demarre le serveur HTTP.

`app.js` cree l'application Express, mais `bin/www` lance vraiment le serveur avec un port.

Exemple:

```js
var server = http.createServer(app);
server.listen(port);
```

### `.env.example`

Ce fichier montre les variables d'environnement attendues.

Il ne contient pas de vrais secrets. Pour travailler localement, tu peux creer un fichier `.env` a partir de cet exemple.

Exemple:

```env
PORT=3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PYTHON_AI_BASE_URL=http://localhost:5000
```

Important: le fichier `.env` ne doit pas etre partage publiquement, car il peut contenir des cles secretes.

### `.gitignore`

Ce fichier indique a Git quels fichiers ne doivent pas etre suivis.

Exemples:

```text
node_modules/
.env
.DS_Store
```

`node_modules` est ignore parce qu'il peut etre regenere avec `npm install`.

## 6. Le dossier `src`

Le dossier `src` contient le code organise de l'API.

```text
src/
  config/
  controllers/
  middlewares/
  routes/
  services/
```

### `src/config/env.js`

Ce fichier centralise les variables d'environnement.

Au lieu d'utiliser `process.env.SUPABASE_URL` partout dans le code, on passe par ce fichier.

Exemple:

```js
module.exports = {
  port: process.env.PORT || '3000',
  supabaseUrl: process.env.SUPABASE_URL || '',
  pythonAiBaseUrl: process.env.PYTHON_AI_BASE_URL || 'http://localhost:5000'
};
```

Avantage: toute la configuration est au meme endroit.

### `src/config/supabase.js`

Ce fichier prepare la connexion a Supabase.

Il verifie que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configures avant de creer le client Supabase.

Plus tard, les services comme `sensorService`, `sosService` ou `authService` utiliseront ce client.

### `src/routes/index.js`

Ce fichier regroupe les routes principales de l'API.

Actuellement:

```js
router.use('/health', healthRoutes);
router.use('/migration', migrationRoutes);
```

Donc:

- `healthRoutes` devient `/api/health`;
- `migrationRoutes` devient `/api/migration`.

### `src/routes/healthRoutes.js`

Ce fichier declare la route de sante:

```text
GET /api/health
```

Elle permet de verifier que le serveur fonctionne.

### `src/controllers/healthController.js`

Un controller contient la logique appelee par une route.

Ici, `getHealth` renvoie:

- l'etat du serveur;
- l'environnement actuel;
- si Supabase est configure;
- si Firebase est configure;
- si OpenWeatherMap est configure.

### `src/routes/migrationRoutes.js`

Ce fichier contient une route temporaire pour suivre la migration:

```text
GET /api/migration/status
```

Elle indique que la strategie est progressive et liste les prochains modules a migrer:

- weather;
- alerts;
- sensors;
- sos;
- auth;
- ai-proxy.

### `src/middlewares/notFound.js`

Ce middleware gere les routes inexistantes.

Exemple:

```text
GET /api/route-inconnue
```

Retourne une erreur JSON:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found"
  }
}
```

### `src/middlewares/errorHandler.js`

Ce middleware gere les erreurs generales.

Il evite de renvoyer une page HTML d'erreur. Pour une API, on prefere toujours renvoyer du JSON.

### `src/services/supabaseService.js`

Un service contient la logique metier ou les appels externes.

Ce fichier contient deja une fonction generique:

```js
selectAll(tableName)
```

Elle permettra de recuperer toutes les lignes d'une table Supabase.

## 7. Comment ajouter une nouvelle route

Exemple: ajouter une route pour les capteurs.

### Etape 1: creer un controller

Fichier:

```text
src/controllers/sensorController.js
```

Exemple:

```js
function getSensors(req, res) {
  res.json({
    success: true,
    data: []
  });
}

module.exports = {
  getSensors: getSensors
};
```

### Etape 2: creer une route

Fichier:

```text
src/routes/sensorRoutes.js
```

Exemple:

```js
var express = require('express');
var sensorController = require('../controllers/sensorController');

var router = express.Router();

router.get('/', sensorController.getSensors);

module.exports = router;
```

### Etape 3: brancher la route dans `src/routes/index.js`

```js
var sensorRoutes = require('./sensorRoutes');

router.use('/sensors', sensorRoutes);
```

La route finale devient:

```text
GET /api/sensors
```

## 8. Plan de migration Alerti

La migration doit rester progressive.

Ordre recommande:

1. Migrer les routes simples: health, weather, alert calculation.
2. Migrer les routes Supabase: sensors, SOS, conseils, quiz.
3. Migrer les notifications FCM.
4. Migrer l'authentification JWT.
5. Garder le service Python IA actif et l'appeler depuis Node.js.
6. Basculer Flutter endpoint par endpoint.

## 9. Pourquoi garder Python pour l'IA au debut

Le service Python actuel utilise des bibliotheques IA comme Keras, NumPy et Joblib.

Ces outils sont tres naturels en Python. Les porter directement vers Node.js demanderait plus de travail.

La meilleure approche au debut:

```text
Flutter -> Node.js API -> Python IA -> Modeles LSTM/CNN
```

Node.js devient l'API principale, mais Python continue de faire les predictions.

## 10. Commandes utiles

```bash
npm install
npm start
npm run check
```

Tester l'API:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/migration/status
curl "http://localhost:3000/api/alerts/calculate?niveauEau=75&seuilEau=100"
```

## 11. Premiere route migree

La premiere route migree depuis Spring Boot est:

```text
GET /api/alerts/calculate?niveauEau=75&seuilEau=100
```

Elle vient de l'ancien controller Java:

```text
GET /api/alerts/calculate
```

Cette route calcule le niveau d'alerte a partir de deux valeurs:

- `niveauEau`: le niveau d'eau actuel;
- `seuilEau`: le seuil critique.

Exemple:

```bash
curl "http://localhost:3000/api/alerts/calculate?niveauEau=75&seuilEau=100"
```

Reponse:

```json
{
  "niveauEau": 75,
  "seuilEau": 100,
  "alertLevel": "ATTENTION",
  "alertLabel": "Attention",
  "alertDescription": "Le niveau d'eau nécessite une surveillance",
  "necessiteNotification": true,
  "pourcentageSeuil": 75
}
```

La logique est la meme que dans Java:

- moins de 60% du seuil: `NORMAL`;
- de 60% a moins de 85%: `ATTENTION`;
- a partir de 85%: `DANGER`.

Le code est separe en trois parties:

- `src/routes/alertRoutes.js`: definit l'URL Express;
- `src/controllers/alertController.js`: lit la requete et renvoie la reponse;
- `src/services/alertService.js`: contient la logique de calcul.

## 12. Prochaine etape

La prochaine migration conseillee est une route meteo simple ou une route Supabase en lecture seule, par exemple les capteurs.
