# Jeux d'Orthophonie

Collection de jeux éducatifs pour l'orthophonie avec police OpenDyslexic et découpage syllabique.

## Jeux Disponibles

### 1. Défilement de Mots
- Défilement lent et personnalisable des mots
- Découpage en syllabes avec la 2ème syllabe en rouge
- Police OpenDyslexic pour une meilleure lisibilité
- Panneau d'administration pour gérer les mots
- Sauvegarde locale des mots dans le localStorage
- Contrôles: Pause/Play, Réinitialiser, Vitesse ajustable

### 2. Trouve le Double
- Deux listes de mots avec un mot en commun
- Trouvez et sélectionnez les deux mots identiques
- Système de score avec sauvegarde
- 2ème syllabe en rouge pour faciliter la lecture
- Panneau admin pour gérer la liste de mots

## Déploiement avec Wrangler (Cloudflare Pages)

### Prérequis

1. Installer Node.js (si pas déjà installé)
2. Installer Wrangler:
   ```bash
   npm install -g wrangler
   ```

3. Se connecter à Cloudflare:
   ```bash
   wrangler login
   ```

### Installation

```bash
npm install
```

### Déploiement

```bash
npm run deploy
```

Ou directement avec Wrangler:

```bash
wrangler pages deploy . --project-name=word-scroller
```

### Développement local

Pour tester localement avec Wrangler:

```bash
npm run dev
```

Puis ouvrez http://localhost:8788

## Utilisation

1. Cliquez sur le bouton "Admin" en haut à droite pour gérer les mots
2. Entrez un mot par ligne avec les syllabes séparées par `•` (Alt+Shift+9 sur Mac)
3. Exemple: `Bon•jour`
4. Cliquez sur "Sauvegarder" pour enregistrer vos modifications
5. Utilisez les contrôles en bas pour ajuster la vitesse et mettre en pause

## Fichiers

- `index.html` - Page d'accueil / Menu principal
- `word-scroller.html` - Jeu de défilement de mots
- `find-doubles.html` - Jeu de recherche de doubles
- `OpenDyslexicAlta-Regular.otf` - Police OpenDyslexic (à ajouter si vous souhaitez utiliser cette police)
- `wrangler.toml` - Configuration Cloudflare
- `package.json` - Configuration npm
- `_headers` - En-têtes de sécurité Cloudflare
- `.github/workflows/deploy.yml` - Workflow de déploiement automatique GitHub Actions
