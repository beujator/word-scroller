# Jeux d'Orthophonie

Collection de jeux éducatifs pour l'orthophonie avec police OpenDyslexic et découpage syllabique. Tous les jeux utilisent un système de listes de mots synchronisées en ligne via Cloudflare KV.

## Jeux Disponibles

### 1. Défilement de Mots
- Défilement lent et personnalisable des mots
- Découpage en syllabes avec la 2ème syllabe en rouge
- Police OpenDyslexic pour une meilleure lisibilité
- Panneau d'administration pour gérer les mots
- Sauvegarde locale des mots dans le localStorage
- Contrôles: Pause/Play, Réinitialiser, Vitesse ajustable
- Sélection de listes en ligne synchronisées

### 2. Trouve le Double
- Deux listes de mots avec un mot en commun
- Trouvez et sélectionnez les deux mots identiques
- Système de score avec sauvegarde
- 2ème syllabe en rouge pour faciliter la lecture
- Panneau admin pour gérer la liste de mots
- Support des listes en ligne

### 3. Associe les Calculs
- Deux colonnes : calculs et résultats
- Associez-les correctement et ils disparaissent
- Génération automatique d'additions ou multiplications
- Assistant IA local pour générer des encouragements personnalisés
- Système de score

### 4. Memory
- Jeu de mémoire classique avec des mots
- Retournez les cartes pour trouver les paires
- Grille 6x3 (18 cartes)
- Moins de coups = plus de points
- 2ème syllabe en rouge pour faciliter la lecture
- Effets visuels avec confettis lors des réussites
- Support des listes en ligne

### 5. La Fusée des Syllabes
- Reconstitue les mots en assemblant les bonnes fusées-syllabes dans l'ordre
- Animation de décollage de fusée quand tu réussis
- 2ème syllabe en rouge
- Système de score basé sur la rapidité
- Support des listes en ligne

### 6. Dictée
- Écoute le mot prononcé et écris-le correctement
- Synthèse vocale française (Web Speech API)
- Bouton pour réécouter le mot autant de fois que nécessaire
- Progression automatique sur bonne réponse (2 secondes)
- Confettis, fusée et messages d'encouragement sur les bonnes réponses
- Compatible iOS avec instructions adaptées
- Support des listes en ligne

### 7. Gestion des Listes (Admin)
- Interface d'administration pour créer et gérer les listes de mots en ligne
- Authentification par token
- Les listes sont synchronisées avec tous les jeux
- Ciblage par jeu (memory, rocket, scroller, doubles, dictee, all)
- Création de listes nommées librement (ex: "Semaine du 4 novembre")

## Architecture Technique

### Frontend
- HTML5 / CSS3 / JavaScript vanilla (aucune dépendance)
- Police OpenDyslexic pour l'accessibilité
- localStorage pour les données locales et le fallback offline
- sessionStorage pour le token d'administration
- Web Speech API pour la synthèse vocale (dictée)
- Canvas Confetti pour les animations de réussite

### Backend
- **Cloudflare Pages** : Hébergement statique
- **Cloudflare Workers** : API REST serverless (`functions/api/lists/[[route]].js`)
- **Cloudflare KV** : Stockage clé-valeur pour les listes de mots
- **API REST** :
  - `GET /api/lists` : Liste toutes les listes disponibles
  - `POST /api/lists` : Crée une nouvelle liste (authentification requise)
  - `GET /api/lists/:name` : Récupère une liste spécifique
  - `DELETE /api/lists/:name` : Supprime une liste (authentification requise)

### Sécurité
- Authentification par Bearer token pour les opérations d'écriture
- Token configuré dans les variables d'environnement Cloudflare
- Les opérations de lecture sont publiques
- Voir `SECURITE.md` pour plus de détails

## Déploiement

### Prérequis

1. Compte Cloudflare avec accès à Pages et Workers KV
2. Node.js installé
3. Wrangler CLI installé :
   ```bash
   npm install -g wrangler
   ```

4. Se connecter à Cloudflare :
   ```bash
   wrangler login
   ```

### Installation

```bash
npm install
```

### Configuration KV

1. Créer un namespace KV dans Cloudflare Dashboard
2. Copier l'ID du namespace
3. Mettre à jour `wrangler.toml` avec le bon ID :
   ```toml
   [[kv_namespaces]]
   binding = "WORD_LISTS"
   id = "VOTRE_KV_NAMESPACE_ID"
   preview_id = "VOTRE_PREVIEW_KV_ID"
   ```

4. Configurer le token d'administration :
   - **Local** : Créer `.dev.vars` avec `ADMIN_TOKEN=votre_token`
   - **Production** : Dans Cloudflare Dashboard → Pages → Settings → Environment Variables, ajouter `ADMIN_TOKEN`

5. Dans Cloudflare Dashboard → Pages → Settings → Functions :
   - Ajouter le binding KV :
     - Variable name: `WORD_LISTS`
     - KV namespace: Sélectionner votre namespace créé

### Développement local

Pour tester localement avec Wrangler :

```bash
npm run dev
```

Puis ouvrir http://localhost:8788

Le fichier `.dev.vars` doit contenir :
```
ADMIN_TOKEN=votre_token_admin
```

### Déploiement en production

```bash
npm run deploy
```

Ou directement avec Wrangler :

```bash
wrangler pages deploy . --project-name=word-scroller
```

Le déploiement peut aussi se faire automatiquement via GitHub Actions (voir `.github/workflows/deploy.yml`).

## Utilisation

### Pour les utilisateurs finaux

1. Aller sur la page d'accueil : https://word-scroller.pages.dev
2. Choisir un jeu parmi les 6 disponibles
3. Dans chaque jeu, sélectionner une liste dans le menu déroulant "Liste en ligne"
4. Jouer !

### Pour l'administrateur

1. Aller sur https://word-scroller.pages.dev/admin-lists.html
2. Entrer le token d'administration
3. Créer/modifier/supprimer des listes de mots
4. Pour chaque liste :
   - Donner un nom libre (ex: "Semaine du 4 novembre")
   - Entrer les mots avec syllabes séparées par `•` (Alt+Shift+9 sur Mac)
   - Exemple : `Bon•jour`, `Or•di•na•teur`
   - Choisir le jeu cible (ou "Tous les jeux")
5. Les listes sont immédiatement disponibles dans tous les jeux

## Format des mots

Les mots doivent être entrés avec les syllabes séparées par le caractère `•` :
- `Bon•jour`
- `Or•di•na•teur`
- `Pa•ra•pluie`

La 2ème syllabe sera automatiquement affichée en rouge dans tous les jeux.

## Compatibilité

- **Navigateurs modernes** : Chrome, Firefox, Safari, Edge
- **iOS/Safari** : Compatible avec workarounds pour la synthèse vocale (dictée)
- **Responsive** : Tous les jeux sont optimisés pour mobile et tablette

## Structure des fichiers

```
ortho/
├── index.html                          # Menu principal
├── word-scroller.html                  # Jeu de défilement
├── find-doubles.html                   # Jeu de recherche de doubles
├── math-match.html                     # Jeu d'association de calculs
├── memory.html                         # Jeu de memory
├── rocket-syllables.html               # Jeu de la fusée des syllabes
├── dictee.html                         # Jeu de dictée
├── admin-lists.html                    # Interface d'administration
├── functions/
│   └── api/
│       └── lists/
│           └── [[route]].js            # API REST Worker
├── wrangler.toml                       # Configuration Cloudflare
├── package.json                        # Configuration npm
├── .dev.vars                           # Variables locales (git ignoré)
├── _headers                            # En-têtes de sécurité
├── README.md                           # Ce fichier
├── SECURITE.md                         # Checklist sécurité
└── OpenDyslexicAlta-Regular.otf        # Police OpenDyslexic
```

## Changelog récent

### Dictée (Dernière mise à jour)
- Correction du flux de progression : passage automatique au mot suivant après 2 secondes sur bonne réponse
- Désactivation des boutons pendant la transition automatique
- Bouton "Mot suivant" manuel uniquement en cas d'erreur
- Messages clarifiés pour guider l'utilisateur

### iOS Compatibility
- Désactivation de l'autoplay sur iOS (nécessite interaction utilisateur)
- Workaround pour `synth.cancel()` et délai de 100ms pour la synthèse vocale
- Banner d'instructions spécifique iOS
- Gestion d'erreurs améliorée

### Memory Game
- Grille améliorée en 6x3 (18 cartes)
- Ajout de confettis lors des paires trouvées
- Meilleur feedback visuel avec animations

### Système de listes en ligne
- Intégration complète dans tous les jeux
- Fallback automatique vers localStorage si offline
- Interface d'administration intuitive
- Synchronisation en temps réel

## Support

Pour toute question ou problème, ouvrir une issue sur le repository GitHub.
