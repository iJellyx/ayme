# AYME — Deploy to Vercel

A single-file learning platform. No build step. No backend. Just an HTML file that Vercel will serve as-is.

Three deploy paths below, from zero-effort to fully automated. Pick one.

---

## Path A — Drag & drop (30 seconds, no git)

1. Go to **https://vercel.com/new**.
2. Sign in.
3. Drag this whole folder onto the upload area (or click **Upload**).
4. Click **Deploy**.

You'll get a `https://ayme-xxxxx.vercel.app` URL. Done.

To update later: edit `index.html`, then repeat the drag-and-drop.

---

## Path B — GitHub + Vercel's native integration (recommended)

This is the one you want for a real "push and it publishes" setup. No GitHub Actions needed — Vercel listens to the repo for you.

### 1. Initialise the repo locally

```bash
cd ayme-vercel
git init
git add .
git commit -m "Initial AYME release"
git branch -M main
```

### 2. Create an empty repo on GitHub (UI or CLI)

```bash
# with GitHub CLI:
gh repo create ayme --private --source=. --remote=origin --push

# or: create "ayme" on github.com, then:
git remote add origin git@github.com:<your-user-or-org>/ayme.git
git push -u origin main
```

### 3. Connect the repo to Vercel

1. Go to **https://vercel.com/new**.
2. Click **Import Git Repository**.
3. Select the `ayme` repo.
4. **Framework Preset**: `Other`. **Build command**: leave blank. **Output directory**: leave blank (root).
5. Click **Deploy**.

From now on every push to `main` auto-deploys to production, and every PR gets its own preview URL.

### 4. Make a change

```bash
# edit index.html
git add index.html
git commit -m "Update MES module"
git push
```

Vercel picks it up within a few seconds. No further action needed.

If you prefer GitHub Actions (e.g. your org requires it), delete the Vercel GitHub integration and use `.github/workflows/deploy.yml` instead — see Path C.

---

## Path C — GitHub Actions (if your org forbids third-party GitHub apps)

`.github/workflows/deploy.yml` is already included. To enable it:

1. Install Vercel CLI locally and link the project once:

   ```bash
   cd ayme-vercel
   npx vercel link
   ```

   This creates `.vercel/project.json` with your `orgId` and `projectId`.

2. In GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**, add:

   | Name | Value |
   |------|-------|
   | `VERCEL_TOKEN` | From https://vercel.com/account/tokens |
   | `VERCEL_ORG_ID` | From `.vercel/project.json` (`orgId`) |
   | `VERCEL_PROJECT_ID` | From `.vercel/project.json` (`projectId`) |

3. Push. The workflow deploys on every push to `main` (production) and every PR (preview).

If you go this route, **disable Vercel's native GitHub integration** so you don't get two deploys per push.

---

## Folder contents

```
ayme-vercel/
├── index.html              # The whole app (progress saved in visitor's browser)
├── vercel.json             # Clean URLs + basic security headers
├── package.json            # No dependencies; just npm scripts (dev, deploy)
├── .gitignore              # Ignores node_modules, .vercel, .env, editor files
├── .github/
│   └── workflows/
│       └── deploy.yml      # Optional GitHub Actions deploy (delete if using Path B)
└── README.md               # This file
```

## Handy local commands

```bash
npm run dev      # Serve locally at http://localhost:3000
npm run deploy   # One-shot deploy to production (requires vercel login)
```

## Operational notes

- **Access control**: deployments are public by default. To restrict to PM Group, turn on **Deployment Protection** under Project → Settings (Vercel Authentication is free; Password Protection needs Pro).
- **Custom domain**: Project → Settings → Domains. Add `ayme.yourdomain.com` and Vercel guides you through the DNS records.
- **Storage**: progress is stored in each visitor's own browser via localStorage. Each person gets a private tracker — no shared backend to manage.
- **Updating content**: edit `index.html` and push (or re-upload). No build. No migrations.
- **Rolling back**: Vercel keeps every deployment. Project → Deployments → click the old one → **Promote to Production**.
