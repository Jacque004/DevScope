# DevScope

Analyse de dépôts GitHub publics : métadonnées (API GitHub), tableau de bord Next.js et API NestJS.

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
