# MÉMOIRE DE PROJET DE FIN D'ÉTUDES

## Conception et Réalisation de la plateforme "DKHOUL"

**Structure du Rapport (Conforme au plan demandé)**

---

### CHAPITRE 1 : ÉTUDE PRÉALABLE

#### 1.1 Présentation du projet DKHOUL

DKHOUL est une plateforme web communautaire dédiée à la location de micro-services (douche, bagagerie, wifi) et d'expériences authentiques. Elle répond à une demande croissante de flexibilité et d'immersion locale de la part des voyageurs modernes.

#### 1.2 Analyse de l'existant

Le marché est dominé par deux modèles :

* **Modèle Transactionnel Mondial (Airbnb, Booking)** : Efficace mais coûteux (commissions >20%) et rigide (pas de location à l'heure).
* **Modèle Informel Local** : Flexible mais risqué (pas de sécurité, paiement cash).

#### 1.3 Étude comparative

| Critère | Airbnb | Nannybag | DKHOUL |
| :--- | :--- | :--- | :--- |
| **Micro-services** | Non | Oui (Bagages) | **Oui (Tout types)** |
| **Expérience Locale** | Standardisée | Nulle | **Authentique** |
| **Commission Hôte** | 3-5% (mais frais élevés Guest) | Fixe | **20% (Modèle Équitable)** |

#### 1.4 Solution proposée

Une application web (SPA) permettant la mise en relation sécurisée, le paiement en ligne et la communication temps réel.

---

### CHAPITRE 2 : ANALYSE ET SPÉCIFICATION DES BESOINS

#### 2.1 Identification des besoins fonctionnels

* **Modules Critiques** :
  * Authentification (JWT) et Profils.
  * Moteur de Recherche (Géolocalisation + Filtres).
  * Système de Réservation (Machine à états).
  * Messagerie Instantanée (Avant réservation).
  * Paiement (Stripe).
  * Administration (Dashboard Super Admin).

#### 2.2 Besoins non-fonctionnels

* **Disponibilité** : 99.9% (Hébergement Cloud).
* **Sécurité** : Protection contre les injections SQL/NoSQL et XSS.
* **Scalabilité** : Architecture capable de supporter 1000 connexions simultanées.

#### 2.3 Acteurs du système

* **Voyageur (Guest)** : Recherche et consomme.
* **Hôte (Host)** : Publie et gère.
* **Super Admin** : Modère et administre.

#### 2.4 Diagrammes de cas d'utilisation

*(Insérer ici le diagramme Use Case global)*

---

### CHAPITRE 3 : CONCEPTION

#### 3.1 Architecture globale du système

Architecture **trois-tiers** moderne :

* **Presentation Layer** : Angular (SPA).
* **Logic Layer** : API Node.js/Express.
* **Data Layer** : MongoDB Atlas.

#### 3.2 Conception de la base de données

Modèle NoSQL orienté documents.

* **Collection `Users`** : Profils, Rôles.
* **Collection `Services`** : Offres géolocalisées.
* **Collection `Bookings`** : Transactions.
* **Collection `Conversations`** : Historique des chats.

#### 3.3 Diagrammes UML détaillés

* **Diagramme de Classes** : (User 1--*Service, Service 1--* Booking).
* **Diagramme de Séquence** : Flux "Paiement Réservation".

---

### CHAPITRE 4 : CHOIX TECHNOLOGIQUES

#### 4.1 Présentation du stack MEAN

* **M**ongoDB : Flexibilité des schémas.
* **E**xpress : Légèreté et performance.
* **A**ngular : Structure MVC rigoureuse (TypeScript).
* **N**ode.js : I/O non-bloquant pour le temps réel.

#### 4.2 Justification

* **Homogénéité** : Langage JavaScript unique Frontend/Backend.
* **Performance** : Angular offre une expérience "App Native" fluide.
* **Socket.io** : Indispensable pour le chat, s'intègre parfaitement à Node.js.

#### 4.3 Outils de développement

* **VS Code** (IDE).
* **Postman** (Test API).
* **Git/GitHub** (Versioning).

---

### CHAPITRE 5 : RÉALISATION

#### 5.1 Environnement de développement

Setup Node 18, Angular CLI 16. Variables d'environnement pour les clés API (`.env`).

#### 5.2 Implémentation Backend (Node.js/Express)

* Structure MVC modulaire.
* Middlewares de sécurité (`helmet`, `cors`, `rateLimit`).
* Gestion des erreurs centralisée (`AppError`).

#### 5.3 Implémentation Frontend (Angular)

* Utilisation des **Signaux (Signals)** pour la réactivité.
* Lazy Loading des modules (Admin, Auth).
* Intercepteurs HTTP pour l'injection du Token JWT.

#### 5.4 Fonctionnalités clés développées

* **Chat Contextuel** : Passage de métadonnées lors de l'initiation du chat.
* **God Mode (Admin)** : Dashboard complet avec modales de confirmation.
* **Paiement** : Intégration Stripe Elements.

---

### CHAPITRE 6 : TESTS ET VALIDATION

#### 6.1 Stratégie de tests

Approche mixte : Tests unitaires pour la logique critique, tests manuels pour l'UI.

#### 6.2 Tests unitaires / Intégration

* Tests des endpoints API via Postman (Collections automatisées).
* Tests des services email (`testEmail.js`).

#### 6.3 Tests End-to-End

Validation des parcours utilisateurs critiques :

1. Inscription -> Email de Bienvenue.
2. Création Service -> Validation Admin.
3. Recherche -> Réservation -> Paiement.

---

### CHAPITRE 7 : DÉPLOIEMENT ET MISE EN PRODUCTION

#### 7.1 Architecture de déploiement

Déploiement en mode **Serverless/PaaS** pour minimiser la maintenance infrastructure.

#### 7.2 Configuration des serveurs

* **Backend (Render)** :
  * Hébergement du service Node.js.
  * Variables d'environnement sécurisées (Secrets).
  * Auto-deploy depuis la branche `prod`.
* **Frontend (Vercel)** :
  * Hébergement statique mondial (CDN).
  * Build optimisé (`ng build --prod`).
  * Routing SPA (Redirections `index.html`).

#### 7.3 Pipeline CI/CD

Intégration Continue via GitHub :

1. Push sur `main` détecté par Vercel et Render.
2. Lancement des builds.
3. Déploiement automatique si le build réussit.

#### 7.4 Monitoring

* Logs applicatifs via la console Render.
* Dashboard MongoDB Atlas pour la santé de la base de données.

---

### CONCLUSION GÉNÉRALE

Bilan très positif. Le projet DKHOUL est techniquement abouti et répond aux exigences initiales. L'architecture choisie assure pérennité et évolutivité.

---
*Généré par Antigravity - Structure Stricte 7 Chapitres*
