# DevScope

Analyse de dépôts GitHub publics : métadonnées (API GitHub), tableau de bord Next.js et API NestJS.

**Ce dépôt GitHub est la source du projet** : chaque push peut redéployer l’interface (Vercel) et l’API (Render) si vous les avez connectées à ce repo.

## Utiliser l’application dans le navigateur (sans cloner)

1. Déployez l’API puis le front en suivant **[Déploiement en ligne](#déploiement-en-ligne)** ci-dessous.
2. Ouvrez **l’URL Vercel** obtenue : c’est l’application complète (dashboard, comparaison, appels `/api` vers votre API).

Une fois déployé, ajoutez en tête de ce README (ou dans la description du dépôt) le lien public, par exemple : `https://votre-projet.vercel.app`.

## Développement local

### Prérequis

- Node.js 20+
- `npm install` à la racine du projet

### Démarrage

```bash
npm run dev
```

- Interface : [http://localhost:3000](http://localhost:3000)
- API : [http://localhost:3001/api](http://localhost:3001/api) (ex. `/api/health`)

Variables : copier [`.env.example`](.env.example) vers `.env` à la racine.

### Structure

- [`apps/web`](apps/web) — Next.js (App Router)
- [`apps/api`](apps/api) — NestJS

### Build

```bash
npm run build
```

## Déploiement en ligne

L’app complète = **Next.js** (`apps/web`) + **API NestJS** (`apps/api`).

### 1. API sur Render

1. [Render](https://render.com) → **New** → **Blueprint** ou **Web Service**.
2. Connecter ce dépôt GitHub ; utiliser [`render.yaml`](render.yaml) si proposé.
3. **Environment** : **`GITHUB_TOKEN`** ([token lecture](https://github.com/settings/tokens)).
4. Noter l’URL publique, ex. `https://devscope-api.onrender.com` — test : `/api/health`.

### 2. Front sur Vercel

1. [Vercel](https://vercel.com) → **Add New** → **Project** → importer **ce même dépôt**.
2. **Root Directory** : `apps/web` (voir [`apps/web/vercel.json`](apps/web/vercel.json)).
3. **Environment Variables** (Production + Preview) :
   - **`INTERNAL_API_URL`** = URL Render, ex. `https://devscope-api.onrender.com` (sans `/` final).
4. Déployer : l’URL Vercel sert l’interface ; `/api/*` est proxifié vers l’API.

**Redéploiement automatique** : une fois Render et Vercel connectés à ce dépôt GitHub, chaque `git push` sur `main` déclenche en général un nouveau build côté hébergeur (vérifiez l’option *Auto-Deploy* / branche `main`). Le workflow **[CI](.github/workflows/ci.yml)** sur GitHub vérifie en parallèle que `npm run build` réussit.

### Optionnel

- **LLM** : variables dans [`.env.example`](.env.example) sur Render.
- **CORS** : `CORS_ORIGIN=https://votre-app.vercel.app` sur Render si vous restreignez les origines.

## Page sur GitHub Pages (optionnel)

Une **page d’accueil statique** ([`docs/index.html`](docs/index.html)) peut être publiée sur  
`https://<user>.github.io/DevScope/` en activant **Settings → Pages → Branch `main` → dossier `/docs`**.  
Elle sert de vitrine / liens ; l’application complète reste celle déployée sur **Vercel** ci-dessus.
