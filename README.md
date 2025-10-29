# Word Scroller

Un défilement de mots avec découpage syllabique et mise en évidence de la 2ème syllabe.

## Fonctionnalités

- Défilement lent et personnalisable des mots
- Découpage en syllabes avec la 2ème syllabe en rouge
- Police OpenDyslexic pour une meilleure lisibilité
- Panneau d'administration pour gérer les mots
- Sauvegarde locale des mots dans le localStorage
- Contrôles: Pause/Play, Réinitialiser, Vitesse ajustable

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

- `index.html` - Application principale
- `OpenDyslexicAlta-Regular.otf` - Police OpenDyslexic (à ajouter si vous souhaitez utiliser cette police)
- `wrangler.toml` - Configuration Cloudflare
- `package.json` - Configuration npm
- `_headers` - En-têtes de sécurité Cloudflare
