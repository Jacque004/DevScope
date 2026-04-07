# DevScope

Analyse de dépôts GitHub publics : métadonnées (API GitHub), tableau de bord Next.js et API NestJS.

## Sur GitHub vous ne voyez que ce README ?

C’est normal. La page d’accueil du dépôt affiche le fichier `README.md`. **L’application ne tourne pas sur GitHub** : le code est versionné ici, mais l’interface s’ouvre **en local** après installation (ou sur un hébergeur si vous déployez le projet).

- **Voir le code** : onglet **Code**, puis ouvrez les dossiers [`apps/web`](apps/web) (interface Next.js) et [`apps/api`](apps/api) (API NestJS).
- **Lancer l’app sur votre machine** : prérequis + commandes ci-dessous (`npm run dev`), puis ouvrez `http://localhost:3000`.

## Prérequis

- Node.js 20+
- `npm install` à la racine du projet

## Démarrage

```bash
npm run dev
```

- Interface : [http://localhost:3000](http://localhost:3000)
- API : [http://localhost:3001/api](http://localhost:3001/api) (ex. `/api/health`)

Variables d’environnement : copier `.env.example` vers `.env` à la racine.

## Structure

- `apps/web` — Next.js (App Router)
- `apps/api` — NestJS

## Build

```bash
npm run build
```
