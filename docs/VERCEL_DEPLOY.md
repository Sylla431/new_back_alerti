# Déploiement Vercel — new-back-alerti

Ce projet Express est exposé comme **une seule Serverless Function** Vercel
(`api/index.js`) avec un rewrite de toutes les routes.

> La skill React/Next.js best practices ne s'applique pas à cette API Express.
> Ici on utilise le runtime Node de Vercel Functions.

## Architecture sur Vercel

```text
Flutter / client
   │
   ▼
Vercel rewrite /* → /api
   │
   ▼
api/index.js  →  Express app.js
   │
   ├── Supabase
   ├── OpenWeatherMap
   ├── Firebase / FCM gateway
   └── PYTHON_AI_BASE_URL (service IA déployé séparément)
```

## Prérequis

1. Compte Vercel + CLI: `npm i -g vercel`
2. Variables d'environnement configurées (voir ci-dessous)
3. **Important:** `PYTHON_AI_BASE_URL` ne doit **pas** être `localhost` en prod.
   Pointer vers le service Flask déployé (ex. Railway).

## Variables d'environnement (Vercel Dashboard → Settings → Environment Variables)

Obligatoires:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
OPENWEATHERMAP_API_KEY
```

Recommandées:

```text
CORS_ORIGIN=*
PYTHON_AI_BASE_URL=https://ton-api-python.up.railway.app
FCM_GATEWAY_URL=
FCM_GATEWAY_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Notes:

- Pour `FIREBASE_PRIVATE_KEY`, coller la clé avec `\n` échappés (une seule ligne).
- Ne jamais committer `.env`.

## Déployer

Depuis ce dossier:

```bash
cd /Users/macpro/IdeaProjects/new_back_alerti
vercel login
vercel link
vercel env pull .env.local   # optionnel
vercel --prod
```

Ou:

```bash
npm run vercel:deploy
```

## Tester après déploiement

Remplace `https://TON-PROJET.vercel.app` :

```bash
curl https://TON-PROJET.vercel.app/api/health
curl https://TON-PROJET.vercel.app/api/migration/status
curl https://TON-PROJET.vercel.app/quiz/full-quiz-data
curl -X POST https://TON-PROJET.vercel.app/auth/mobile/login \
  -H 'Content-Type: application/json' \
  -d '{"num_tel":"...","password":"..."}'
```

## Brancher Flutter

Dans `app_config.dart`, pointer `Environment.development` (ou production) vers l'URL Vercel:

```dart
'https://TON-PROJET.vercel.app'
```

Plus besoin de ngrok pour tester sur téléphone.

## Limites serverless à connaître

- Pas de process long / MQTT / scheduler in-memory stable (cold start).
- Timeout max function: 60s (configuré dans `vercel.json`).
- Le proxy IA dépend de la disponibilité de `PYTHON_AI_BASE_URL`.
- Le filesystem est en lecture seule: pas d'écriture disque locale.

## Fichiers ajoutés

- `api/index.js` — handler serverless
- `vercel.json` — rewrite + maxDuration
- `.vercelignore` — exclut docs/views inutiles du bundle
