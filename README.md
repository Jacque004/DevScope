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

## Déploiement en ligne (sans cloner)

L’app complète = **Next.js** (`apps/web`) + **API NestJS** (`apps/api`). GitHub Pages ne suffit pas. Ordre recommandé :

### 1. API sur Render

1. Compte [Render](https://render.com) → **New** → **Blueprint** (ou **Web Service**).
2. Connecter le dépôt GitHub ; à la racine, utiliser le fichier [`render.yaml`](render.yaml) si proposé.
3. Dans **Environment**, ajouter **`GITHUB_TOKEN`** (token lecture seule [GitHub](https://github.com/settings/tokens)) pour éviter les quotas trop bas.
4. Après déploiement, copier l’URL publique, ex. `https://devscope-api.onrender.com` (test : `/api/health`).

### 2. Front sur Vercel

1. Compte [Vercel](https://vercel.com) → **Add New** → **Project** → importer le même dépôt.
2. **Root Directory** : `apps/web` (important : le fichier [`apps/web/vercel.json`](apps/web/vercel.json) installe le monorepo depuis la racine).
3. **Environment Variables** (Production + Preview) :
   - **`INTERNAL_API_URL`** = URL de l’API Render, ex. `https://devscope-api.onrender.com` (sans `/` final).
4. Déployer. L’URL Vercel (ex. `https://devscope.vercel.app`) sert l’interface ; les appels `/api/*` sont proxifiés vers l’API via cette variable.

### 3. Optionnel

- **LLM** : sur Render, reprendre les variables du fichier [`.env.example`](.env.example) (`LLM_ENABLED`, `OPENAI_*` ou Ollama si accessible).
- **CORS** : par défaut l’API accepte n’importe quel `Origin` si `CORS_ORIGIN` est vide. Pour restreindre : `CORS_ORIGIN=https://votre-app.vercel.app` sur Render.

## GitHub Pages (`*.github.io/...`) et erreur 404

**Pourquoi vous voyiez une 404**

GitHub Pages ne publie **rien** tant que vous n’avez pas choisi une source (dossier `docs/`, branche `gh-pages`, ou workflow). Sans `index.html` dans ce qui est publié, l’URL du site renvoie **404**.

**Ce dépôt inclut une page d’accueil statique** dans [`docs/index.html`](docs/index.html) (texte d’information + liens). Après `git pull`, configurez Pages :

1. Sur GitHub : **Settings** → **Pages**
2. **Build and deployment** → **Source** : *Deploy from a branch*
3. **Branch** : `main`, dossier **`/docs`**, puis **Save**
4. Attendez 1–2 minutes : le site sera à **`https://jacque004.github.io/DevScope/`** (pas sous `/apps/web/`).

Cette page **n’est pas** l’application Next.js complète (voir ci-dessous).

**Pourquoi `.../DevScope/apps/web/` renverra toujours 404 sur Pages**

1. **GitHub Pages ne reproduit pas l’arborescence du dépôt** (`apps/web`, etc.). Il sert uniquement les fichiers publiés (ici le contenu de `docs/`).
2. **L’app complète n’est pas un site statique** : le front Next.js s’appuie sur une **API NestJS**. Les Pages **n’exécutent pas Node.js**.

**En pratique** : pour une URL publique avec l’app complète, déployez plutôt :

- **Vercel**, **Netlify** ou **Cloudflare Pages** pour `apps/web` (avec variables d’environnement pointant vers l’URL de l’API) ;
- **Railway**, **Render**, **Fly.io**, etc. pour `apps/api` ;
- ou un **VPS** / Docker avec les deux services.

Tester l’application reste le plus simple en local : `npm run dev` puis [http://localhost:3000](http://localhost:3000).
