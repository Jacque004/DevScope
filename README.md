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

## GitHub Pages (`*.github.io/...`) et erreur 404

**Pourquoi `https://jacque004.github.io/DevScope/apps/web/` renvoie 404**

1. **GitHub Pages ne reproduit pas l’arborescence du dépôt** (`apps/web`, etc.). Il sert uniquement les fichiers que vous publiez (souvent un dossier `out/` ou `docs/` avec un `index.html` à la racine du site).
2. **Ce projet n’est pas un site statique seul** : le front Next.js s’appuie sur une **API NestJS** (réécritures `/api/*` → backend). Les Pages GitHub **n’exécutent pas Node.js** : pas de Next « serveur », pas d’API Nest sur Pages.

**En pratique** : pour une URL publique, déployez plutôt :

- **Vercel**, **Netlify** ou **Cloudflare Pages** pour `apps/web` (avec variables d’environnement pointant vers l’URL de l’API) ;
- **Railway**, **Render**, **Fly.io**, etc. pour `apps/api` ;
- ou un **VPS** / Docker avec les deux services.

Tester l’application reste le plus simple en local : `npm run dev` puis [http://localhost:3000](http://localhost:3000).
