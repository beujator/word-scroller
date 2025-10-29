# Configuration du Déploiement Automatique

## Option 1 : Dashboard Cloudflare (Recommandé)

Cette méthode est la plus simple et ne nécessite aucune configuration de secrets.

### Étapes :

1. Poussez votre code sur GitHub
2. Allez sur https://dash.cloudflare.com
3. Naviguez vers "Workers & Pages" > "Create application" > "Pages"
4. Cliquez sur "Connect to Git"
5. Sélectionnez votre repository GitHub
6. Configuration :
   - Build command: (laisser vide)
   - Build output directory: `/`
7. Cliquez sur "Save and Deploy"

✅ Cloudflare déploiera automatiquement à chaque push sur `main`

---

## Option 2 : GitHub Actions

Si vous préférez utiliser GitHub Actions pour plus de contrôle.

### 1. Obtenir les identifiants Cloudflare

**API Token :**
- Allez sur https://dash.cloudflare.com/profile/api-tokens
- Cliquez sur "Create Token"
- Utilisez le template "Edit Cloudflare Workers"
- Ou créez un token personnalisé avec les permissions :
  - Account > Cloudflare Pages > Edit
- Copiez le token généré

**Account ID :**
- Allez sur https://dash.cloudflare.com
- Sélectionnez votre compte
- Dans l'URL ou dans la sidebar, trouvez votre Account ID (format: 32 caractères hexadécimaux)
- Ou allez dans "Workers & Pages" > cliquez sur votre projet > l'Account ID est visible à droite

### 2. Configurer les secrets GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur "Settings" > "Secrets and variables" > "Actions"
3. Cliquez sur "New repository secret"
4. Ajoutez ces deux secrets :

   **CLOUDFLARE_API_TOKEN**
   - Collez votre API Token Cloudflare

   **CLOUDFLARE_ACCOUNT_ID**
   - Collez votre Account ID Cloudflare

### 3. Pousser le workflow

```bash
git add .github/
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### 4. Vérifier le déploiement

- Allez dans l'onglet "Actions" de votre repository GitHub
- Vous verrez le workflow "Deploy to Cloudflare Pages" s'exécuter
- Une fois terminé (✅), votre site sera déployé !

---

## Différences entre les deux options

| Fonctionnalité | Dashboard Cloudflare | GitHub Actions |
|----------------|----------------------|----------------|
| Configuration | Simple, interface web | Nécessite des secrets |
| Contrôle | Géré par Cloudflare | Contrôle total du workflow |
| Logs | Dashboard Cloudflare | GitHub Actions tab |
| Preview deployments | Automatique pour les PRs | Configurable |
| Recommandé pour | Débutants, simplicité | Workflows complexes |

---

## Commandes utiles

```bash
# Voir les déploiements
npx wrangler pages deployment list --project-name=word-scroller

# Déployer manuellement
npx wrangler pages deploy . --project-name=word-scroller

# Rollback vers un déploiement précédent (via dashboard uniquement)
```
