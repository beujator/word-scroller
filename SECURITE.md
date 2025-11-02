# Sécurité du projet - Liste de contrôle

## ✅ Avant de déployer en production

### 1. Token d'administration fort
- [ ] Générer un token sécurisé (32+ caractères)
- [ ] Le configurer dans Cloudflare Pages Environment Variables
- [ ] Ne JAMAIS commiter le token dans Git

**Générer un token sécurisé** :
```bash
# Sur Mac/Linux
openssl rand -hex 32

# Ou sur n'importe quel système
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configuration Cloudflare Pages
- [ ] Aller sur https://dash.cloudflare.com
- [ ] Pages > word-scroller > Settings > Environment variables
- [ ] Ajouter `ADMIN_TOKEN` = votre token généré
- [ ] Choisir "Production" et "Preview"

### 3. Rate Limiting (Optionnel mais recommandé)
- [ ] Cloudflare Dashboard > Security > WAF
- [ ] Créer une règle pour `/api/lists/*` avec méthode POST/DELETE
- [ ] Limiter à 10 requêtes par minute par IP

### 4. Monitoring
- [ ] Activer les logs Cloudflare Pages
- [ ] Surveiller les tentatives d'accès non autorisées

## 🔍 Niveaux de risque

### Risque FAIBLE (Usage personnel/familial)
- Site utilisé uniquement par vous et votre famille
- Peu de valeur pour un attaquant
- Token simple OK : `motdepasse123`

### Risque MOYEN (Usage professionnel)
- Utilisé par des thérapeutes/enseignants
- Données d'enfants/patients
- Token fort REQUIS + rotation tous les 3 mois

### Risque ÉLEVÉ (Usage public)
- Site accessible au grand public
- Beaucoup d'utilisateurs
- Token fort REQUIS + rate limiting + monitoring

## 📋 Checklist de sécurité actuelle

✅ Authentification par token pour les écritures
✅ Validation des données côté serveur
✅ Protection XSS (escapeHtml + textContent)
✅ Pas d'injection SQL (KV store)
✅ CORS configuré correctement
✅ Lectures publiques (normal pour un site éducatif)

❌ Pas de rate limiting (ajouter sur Cloudflare)
❌ Pas d'expiration de token (rotation manuelle)
⚠️ Token en sessionStorage (acceptable pour admin)

## 🎯 Pour votre cas d'usage

**Site d'orthophonie familial/petit cabinet** :
- Risque : **FAIBLE à MOYEN**
- Le risque principal : Quelqu'un modifie vos listes de mots
- Impact : Faible (pas de données sensibles, juste des listes de mots)
- Recommandation : **Token fort (20+ caractères) suffit**

**Données à risque** :
- Listes de mots → Public (pas sensible)
- Scores → Stockés en localStorage (jamais envoyés au serveur)
- Aucune donnée personnelle collectée ✅

## 🚀 Amélioration future (si nécessaire)

### Phase 2 : Authentification complète
- Login avec email + mot de passe
- JWT tokens avec expiration
- Comptes utilisateurs multiples

### Phase 3 : Audit
- Logs de toutes les modifications
- Historique des changements
- Alertes sur tentatives suspectes

## 💡 Verdict

**Pour un site éducatif personnel/familial** : ✅ Sécurité suffisante
**Pour un usage professionnel** : ⚠️ Ajouter rate limiting
**Pour un site public** : ❌ Nécessite authentification avancée

---

**Note importante** : Ce site ne collecte AUCUNE donnée personnelle. Les scores sont stockés localement dans le navigateur. Le seul risque est la modification non autorisée des listes de mots, qui peut être facilement corrigée en quelques clics.
