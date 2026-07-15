# Inventaire API — Migration Node.js

Inventaire des contrats HTTP à préserver pour ne pas casser Flutter.

## Spring Boot (`Back_end-Alert-I`)

| Méthode | Route | Dépendances | Statut Node |
|---------|-------|-------------|-------------|
| POST | `/auth/register` | Supabase users | migré |
| POST | `/auth/login` | Supabase users, JWT | migré |
| POST | `/auth/mobile/register` | Supabase users | migré |
| POST | `/auth/mobile/login` | Supabase users, JWT | migré |
| POST | `/auth/mobile/password/reset/request` | Supabase users | migré |
| POST | `/auth/mobile/password/reset/confirm` | Supabase users | migré |
| GET | `/auth/mobile/me` | JWT + Supabase | migré |
| GET | `/quiz/full-quiz-data` | Supabase quiz | migré |
| GET | `/quiz/questions-by-quiz?quizId=` | Supabase | migré |
| POST | `/api/quiz/add-quiz` | Supabase | migré |
| POST | `/api/quiz/:id/add-question` | Supabase | migré |
| GET | `/api/conseils/type/:type` | Supabase conseil | migré |
| POST | `/api/conseils/add_conseil` | Supabase | migré |
| GET | `/api/alerts/calculate` | logique locale | migré |
| GET/POST | `/api/alerts/*` (sensor) | Supabase + alert cache | partiel |
| GET | `/api/weather/current/:localite` | OpenWeather | migré |
| GET | `/api/weather/forecast/:localite` | OpenWeather | migré |
| GET | `/api/weather/alert-test/:localite` | OpenWeather | migré |
| GET | `/api/weather/debug/:localite` | OpenWeather | migré |
| GET | `/api/weather/sensor/:id` | Supabase + OpenWeather | migré |
| GET | `/api/sensors` | Supabase sensors | migré |
| POST | `/api/sensors/adddispo` | Supabase sensors | migré |
| GET | `/api/sensors/:id/history` | Supabase history | migré |
| GET | `/api/sensors/:id/history-by-date` | Supabase history | migré |
| GET | `/sensors/:sensorId` | sensor + history | migré |
| POST | `/api/sos/signal` | Supabase sos_signals + FCM | migré |
| POST | `/api/sos/signal-anonyme` | Supabase + FCM | migré |
| GET | `/api/sos/signaux` | Supabase | migré |
| GET | `/api/sos/signaux/user/:userId` | Supabase | migré |
| GET | `/api/sos/signal/:id` | Supabase | migré |
| PATCH | `/api/sos/signal/:id/statut` | Supabase | migré |
| GET | `/api/sos/statistiques` | Supabase | migré |
| GET | `/api/sos/urgents` | Supabase | migré |
| GET | `/api/sos/types-urgence` | statique | migré |
| GET | `/api/sos/priorites` | statique | migré |
| GET | `/api/sos/statuts` | statique | migré |
| GET/POST | `/api/notifications/*` | FCM tokens + gateway/Firebase | migré |

## Flask IA (`alerti`)

| Méthode | Route | Usage Flutter | Statut Node |
|---------|-------|---------------|-------------|
| POST | `/api/predict` | oui | proxy |
| POST | `/api/predict-meteo` | oui | proxy |
| POST | `/api/bamako/predict` | oui | proxy |
| POST | `/api/predict-image` | oui | proxy |
| GET | `/api/alerts` | oui | proxy |
| GET | `/api/forecast/:country` | oui | proxy |
| GET | `/api/countries` | oui | proxy |
| GET | `/api/mali/neighborhoods` | oui | proxy |
| GET | `/api/mali/neighborhood/:name/predict` | oui | proxy |
| POST | `/api/predict/neighborhood` | oui | proxy |
| POST | `/api/subscribe/push` | oui | proxy |
| POST | `/api/alert/subscribe` | oui | proxy |
| GET | `/api/weather/at` | oui | proxy |
| GET | `/api/health` | — | proxy |

## Formats Flutter critiques

- Auth mobile: `POST /auth/mobile/login` → `{ "token": "..." }`
- Conseils: `GET /api/conseils/type/:type`
- Quiz: `GET /quiz/full-quiz-data`, `GET /quiz/questions-by-quiz?quizId=`
- SOS: `POST /api/sos/signal-anonyme` → `{ success, message, data }`
- IA: base URL séparée (`AlertiFloodApiService`) vers Flask ; le proxy Node doit exposer les mêmes chemins
