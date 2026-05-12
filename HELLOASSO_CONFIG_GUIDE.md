# 🎯 Guide d'utilisation - Configuration HelloAsso Multi-Associations

## 📋 Vue d'ensemble

Le système permet maintenant à chaque discipline d'avoir sa propre association HelloAsso (ou de partager une association commune).

---

## 🚀 Accès à l'interface

### Pour les Admins
1. Connectez-vous avec un compte admin
2. Allez sur **Espace administration** (`/admin`)
3. Cliquez sur **Configuration HelloAsso**

### Pour les Coachs
1. Connectez-vous avec un compte coach
2. Allez sur **Espace coach** (`/coach`)
3. Cliquez sur le bouton **Config HelloAsso** en haut à droite

---

## 🔧 Créer une association HelloAsso (Admin uniquement)

### Étape 1 : Récupérer les credentials sur HelloAsso

1. Connectez-vous sur [HelloAsso](https://www.helloasso.com)
2. Allez dans **Mon compte** → **API et Webhooks**
3. Créez une **application OAuth2** :
   - Notez le `Client ID`
   - Notez le `Client Secret`

### Étape 2 : Créer l'association dans l'interface

1. Cliquez sur **+ Nouvelle association**
2. Remplissez le formulaire :
   - **Nom** : Ex: "MMA Fontainebleau"
   - **Client ID** : Collez le Client ID de HelloAsso
   - **Client Secret** : Collez le Client Secret
   - **API Base URL** : 
     - `https://api.helloasso-sandbox.com` pour les tests
     - `https://api.helloasso.com` pour la production
   - **Organisation Slug** : Visible dans l'URL de votre page HelloAsso
     - Ex: `https://www.helloasso.com/associations/mma-fontainebleau` → `mma-fontainebleau`
   - **Form Slug** : Slug de votre formulaire d'adhésion
     - Ex: `adhesion-2025-2026`
   - **Association active** : Coché

3. Cliquez sur **Créer l'association**

---

## 📌 Assigner une association à une discipline

### Pour les Admins
- Peut assigner n'importe quelle association à n'importe quelle discipline

### Pour les Coachs
- Peut assigner uniquement aux disciplines qu'ils enseignent

### Procédure
1. Dans la section **Disciplines**, cliquez sur **Assigner** (ou **Changer**)
2. Sélectionnez l'association souhaitée
3. L'association est maintenant liée à cette discipline

---

## ⚠️ Points d'attention

### 1. Discipline sans association
❌ **Problème** : Une discipline n'a pas d'association configurée

🔍 **Identification** : Badge jaune "⚠️ Aucune association configurée"

✅ **Solution** : Assigner une association à cette discipline

### 2. Association inactive
❌ **Problème** : L'association est désactivée

🔍 **Identification** : Badge gris "Inactive"

✅ **Solution** : Modifier l'association et cocher "Association active"

### 3. Credentials invalides
❌ **Problème** : Client ID ou Client Secret incorrects

🔍 **Identification** : Erreurs lors des paiements

✅ **Solution** : Modifier l'association et vérifier les credentials

---

## 🔄 Modifier une association

### Admins
- Peuvent modifier toutes les associations

### Coachs
- Peuvent modifier uniquement les associations liées à leurs disciplines

### Procédure
1. Cliquez sur **Modifier** sur l'association
2. Modifiez les champs souhaités
3. Cliquez sur **Enregistrer**

---

## 🗑️ Supprimer une association (Admin uniquement)

⚠️ **Impossible si des disciplines utilisent cette association !**

1. Cliquez sur **Supprimer** sur l'association
2. Confirmez la suppression

---

## 📊 Vérifier la configuration

### Vue Admin
- **Associations** : Liste toutes les associations avec leur nombre de disciplines
- **Disciplines** : Affiche l'association configurée pour chaque discipline

### Indicateurs de santé
- ✅ **Vert** : Association active et configurée
- ⚠️ **Jaune** : Aucune association configurée
- ❌ **Gris** : Association inactive

---

## 🧪 Tester la configuration

1. Assignez une association à une discipline
2. Essayez de créer une adhésion pour cette discipline
3. Vérifiez que le paiement redirige vers le bon compte HelloAsso

---

## 🔐 Sécurité

- Les **Client Secret** sont masqués dans l'interface
- Seuls les **admins** peuvent créer et supprimer des associations
- Les **coachs** ne peuvent modifier que leurs propres associations

---

## 📞 Support

En cas de problème :
1. Vérifiez que l'association est **active**
2. Vérifiez que la discipline a une **association assignée**
3. Testez les credentials sur le portail HelloAsso
4. Consultez les logs du serveur backend

---

**✅ Système opérationnel !** Vous pouvez maintenant gérer vos associations HelloAsso depuis l'interface web.
