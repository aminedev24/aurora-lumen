# Aurora Lumen

AI assistant web/desktop app built with Vite + React.

## Getting Started
- Install: `npm install`
- Dev (default config): `npm run dev`
- Dev with website/chat bases: `vite --config vite.config.website.ts` or `vite --config vite.config.web.ts`

## Builds
- Website: `npm run build:website` (base `/website/`, output `dist/website`)
- Chat: `npm run build:chat` (base `/chat/`, output `dist/chat`)
- Desktop: `npm run build:desktop`
- GitHub Pages (repo path `/aurora-lumen/`): `npm run build:gh` (output `dist/default`)

## Deploy to GitHub Pages
1. Build with the GH base: `npm run build:gh`
2. Publish the output folder `dist/default` to the `gh-pages` branch (keeps your sources on `main`). Example with git subtree:
   ```bash
   git subtree push --prefix dist/default origin gh-pages
   ```
   If the branch doesn’t exist yet, create it once:
   ```bash
   git push origin `git subtree split --prefix dist/default main`:gh-pages --force
   ```
3. In GitHub repo settings, enable Pages → Source: `gh-pages` branch / root.
4. Your site will be at `https://<username>.github.io/aurora-lumen/`.

## First-time Repo Setup (manual)
```bash
echo "# aurora-lumen" >> README.md
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/aminedev24/aurora-lumen.git
git push -u origin main
```

## Notes
- Use `npm run build:gh` for GitHub Pages so assets load under `/aurora-lumen/`.
- The project uses multiple Vite configs; pick the one matching your target (website/chat/desktop).
