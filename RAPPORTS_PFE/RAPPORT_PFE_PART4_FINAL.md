# MÉMOIRE DE PROJET DE FIN D'ÉTUDES

## PARTIE 4 : QUALITÉ, DEVOPS ET CONCLUSION (Chapitres 6 & 7)

---

# CHAPITRE 6 : QUALITÉ LOGICIELLE ET STRATÉGIE DE TEST

La qualité d'une application ne se mesure pas seulement à ses fonctionnalités, mais à sa robustesse et sa fiabilité. Pour le projet **DKHOUL**, nous avons mis en place une stratégie de test couvrant plusieurs niveaux de la pyramide de tests.

## 6.1 Environnement de Test (Isolation)

Un principe fondamental respecté dans ce projet est l'isolation stricte des environnements.

* **Production** : Base de données réelle (`dkhoul`).
* **Test** : Base de données volatile (`dkhoul_test`).

**Extrait de `tests/setup.js` :**
Ce fichier configure Jest pour se connecter à une base de données de test dédiée et la nettoyer (`deleteMany`) après chaque test, garantissant l'indépendance des scénarios.

```javascript
/* backend/tests/setup.js */
beforeAll(async () => {
    // Protection Critique : Empêcher l'exécution sur la base de prod
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('FATAL: Tests must use NODE_ENV=test');
    }
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'dkhoul_test' });
});

afterEach(async () => {
    // Nettoyage automatique entre les tests
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});
```

## 6.2 Tests Unitaires et d'Intégration

Nous avons utilisé le framework **Jest** couplé à **Supertest** pour simuler des requêtes HTTP complètes.

* **Tests d'Authentification (`auth.test.js`)** : Vérification que les mots de passe de moins de 12 caractères sont rejetés, et que le hachage bcrypt fonctionne.
* **Tests de Réservation (`booking.test.js`)** : Simulation d'un cycle complet : *Recherche -> Tentative de réservation (Succès) -> Tentative de surbooking (Echec attendu 400)*.

## 6.3 Tests de Charge et Seeding

Pour valider les performances de l'affichage (notamment la carte et la pagination), il est impossible de tester avec 3 données.
Nous avons développé un script de **Seeding** (`seedServices.js`) capable d'injecter des milliers de services réalistes avec des coordonnées GPS aléatoires autour des grandes villes marocaines (Marrakech, Fès, Essaouira).

**Stratégie de Données Aléatoires :**
Le script génère des titres dynamiques ("Cours de Cuisine - Quartier Gueliz") et assigne des images pertinentes depuis une banque Unsplash pré-sélectionnée, permettant de tester le rendu visuel ("Masonry Layout") du frontend.

---

# CHAPITRE 7 : DÉPLOIEMENT ET DEVOPS

L'industrialisation du projet repose sur une chaîne d'intégration continue et une conteneurisation des applicatifs.

## 7.1 Sauvegardes Automatisées (Disaster Recovery)

La perte de données étant inacceptable, nous avons implémenté un plan de reprise d'activité (PRA) via un scheduler interne.

**Automate de Backup (`utils/backupScheduler.js`) :**
Une tâche planifiée (Cron Job) s'exécute toutes les 12 heures pour exporter les collections JSON critiques (Users, Bookings) vers un stockage sécurisé.

```javascript
/* backend/src/utils/backupScheduler.js */
cron.schedule('0 */12 * * *', () => {
    console.log('⏰ Running Scheduled Backup...');
    backupDB(); // Dump JSON vers /backups/timestamp/
});
```

## 7.2 Dockerisation (Multi-Stage Build)

Pour garantir que l'application "tourne partout" (machine de dev, serveur de test, production), nous utilisons Docker.

**Backend Dockerfile :**
L'image est construite en deux étapes pour réduire sa taille finale (suppression des fichiers sources TS après compilation).

1. **Build Stage** : Installation de toutes les dépendances (`npm install`).
2. **Production Stage** : Copie uniquement des fichiers nécessaires et installation des dépendances de prod (`npm ci --only=production`).

**Frontend Dockerfile :**
Utilisation d'un serveur **Nginx** léger pour servir les fichiers statiques générés par Angular (`ng build --prod`).

## 7.3 Pipeline CI/CD (GitHub Actions)

À chaque "Push" sur la branche `master` :

1. **CI (Continuous Integration)** : Lancement automatique des tests Jest. Si un test échoue, le déploiement est bloqué.
2. **CD (Continuous Deployment)** :
    * Le Frontend est déployé sur **Vercel** (optimisé pour les SPA et le Edge Network).
    * Le Backend est déployé sur **Render** (Support Node.js natif).

---

# CONCLUSION GÉNÉRALE

Le projet de fin d'études **DKHOUL** a permis de répondre à une problématique concrète de l'économie marocaine : comment démocratiser l'accès au marché touristique numérique pour les acteurs locaux, tout en garantissant les standards internationaux de sécurité et d'expérience utilisateur.

## Bilan Technique

La solution développée est fonctionnelle et robuste :

* **Architecture Maîtrisée** : La séparation Frontend/Backend (MEAN Stack) est effective.
* **Sécurité Assurée** : Protection contre les injections, gestion fine des rôles (RBAC), et paiements sécurisés via Stripe.
* **Expérience Utilisateur Moderne** : Temps de réponse rapides, carte interactive et chat temps-réel.

## Bilan Personnel

Ce projet a été un vecteur d'apprentissage majeur. Il a permis de passer de la théorie (cours sur les bases de données, l'algorithmique) à la pratique industrielle (gestion de la concurrence, webhooks de paiement, déploiement Docker). La gestion de la complexité, notamment sur le module de réservation, a renforcé mes compétences en modélisation logicielle.

## Perspectives (Future Work)

Pour transformer ce prototype en produit commercialisable à grande échelle, trois axes d'évolution sont identifiés :

1. **Application Mobile Native (React Native)** : C'est la priorité numéro 1. Les hôtes marocains (artisans, guides) n'ont pas toujours d'ordinateur, mais ils ont tous un smartphone. Une application mobile dédiée aux hôtes ("Dkhoul Host") faciliterait la gestion des réservations sur le terrain.
2. **Blockchain pour les Avis (Trust Economy)** : Le fléau des faux avis mine la confiance. L'intégration d'un Smart Contract (Ethereum/Polygon) permettrait de certifier qu'un avis ne peut être déposé que par une adresse ayant réellement effectué et payé la transaction.
3. **Big Data & Pricing Dynamique** : En analysant l'historique des réservations, l'application pourrait suggérer aux hôtes le "Prix Juste" en temps réel, en fonction de la saisonnalité et de la demande, maximisant ainsi leurs revenus.

---
**FIN DU MÉMOIRE**
