# MÉMOIRE DE PROJET DE FIN D'ÉTUDES

## Projet : DKHOUL - Plateforme de Tourisme Expérientiel au Maroc

---

# REMERCIEMENTS & DÉDICACES

*(À personnaliser par l'étudiant)*

---

# INTRODUCTION GÉNÉRALE

Le secteur touristique marocain traverse une mutation profonde. Historiquement orienté vers un modèle de masse standardisé (hôtels, circuits fermés), il fait face aujourd'hui à une demande croissante pour un tourisme plus authentique, immersif et personnalisé. Les voyageurs modernes, en quête de sens, cherchent à vivre des expériences locales uniques ("Experiential Travel") plutôt qu'à simplement visiter des lieux.

Cependant, l'offre actuelle peine à répondre efficacement à cette demande. D'un côté, les plateformes internationales comme Airbnb ou Booking.com imposent des modèles rigides et des commissions élevées, souvent inadaptés à la réalité des petits prestataires locaux (artisans, guides indépendants, familles d'accueil). De l'autre, le marché informel marocain, bien que riche en expériences authentiques, souffre d'un manque de visibilité, de sécurité et de confiance numérique.

C'est dans ce contexte que s'inscrit le projet **DKHOUL**. Il s'agit d'une plateforme web de mise en relation directe entre des voyageurs et des hôtes marocains proposant des services variés : hébergements, compétences (ateliers), et connexions sociales. Le projet vise à démocratiser l'accès au marché touristique numérique pour les locaux tout en garantissant une expérience sécurisée (paiements, vérification) et fluide pour les visiteurs.

Ce mémoire retrace le cycle de vie complet de l'ingénierie de ce projet, de l'analyse des besoins à son déploiement. Il est structuré en deux parties majeures : une phase d'analyse et de conception architecturale, suivie d'une phase de réalisation technique et d'industrialisation.

---

# CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE

## 1.1 Le Tourisme au Maroc : Changement de Paradigme

Le Maroc, avec plus de 13 millions de touristes (chiffres 2019/2023), est une destination majeure. Toutefois, la répartition des retombées économiques reste inégale. Le modèle "Tout Inclus" isole souvent le voyageur de la réalité locale.
L'émergence du **tourisme expérientiel** change la donne. Le voyageur veut apprendre à cuisiner un tajine, dormir dans un bivouac non-standardisé, ou apprendre la poterie avec un mbalem. Ce marché de niche représente une opportunité économique immense pour l'inclusion financière des populations locales.

## 1.2 Étude de l'Existant et Limites

Les solutions actuelles présentent des lacunes :

1. **Airbnb Experiences** : Très orienté "Show", commissions élevées (20%+), et processus d'onboarding complexe pour un artisan rural.
2. **Réseaux Sociaux (Instagram/WhatsApp)** : Très utilisés au Maroc, mais sans cadre contractuel, sans paiement sécurisé, et avec un risque élevé d'arnaques ou de "no-show".
3. **Agences traditionnelles** : Manque de flexibilité et coût élevé.

## 1.3 Problématique Ingénierie

La question centrale de ce projet est technique et architecturale :
> *"Comment concevoir et développer une place de marché (Marketplace) temps-réel, sécurisée et scalable, capable de gérer des types de services hétérogènes (logement, activité, service) tout en assurant la confiance numérique entre des acteurs anonymes ?"*

---

# CHAPITRE 2 : ANALYSE ET SPÉCIFICATIONS

## 2.1 Spécifications Fonctionnelles (Acteurs)

### 2.1.1 Le Voyageur (Guest)

* **Recherche Géolocalisée** : Trouver des services autour de sa position ou d'une ville cible.
* **Filtrage Avancé** : Par prix, catégorie (Skill, Space, Connect), et évaluation.
* **Réservation & Paiement** : Flux transactionnel complet avec paiement par carte bancaire (Stripe).
* **Communication** : Chat temps-réel avec l'hôte pour clarifier les détails avant réservation.

### 2.1.2 L'Hôte (Host)

* **Gestion des Annonces** : Création de services avec uploads de médias et géolocalisation précise.
* **Gestion des Disponibilités** : Calendrier et slots horaires.
* **Workflow de Réservation** : Accepter ou refuser les demandes entrantes (système d'approbation).
* **Tableau de Bord** : Suivi des gains et des statistiques (vues, réservations).

### 2.1.3 L'Administrateur (SuperAdmin)

* **God Mode** : Vue d'ensemble sur tous les utilisateurs et services.
* **Modération** : Capacité de bannir des utilisateurs ou de supprimer des contenus inappropriés.
* **Analytics** : Métriques globales de la plateforme (Volume d'affaires, nouveaux inscrits).

## 2.2 Exigences Non-Fonctionnelles

* **Performance** : Le temps de chargement initial (First Contentful Paint) doit être inférieur à 1.5s (assuré par Angular SSR/Hydration).
* **Sécurité** :
  * Protection contre les injections NoSQL et XSS.
  * Authentification robuste via JWT.
  * Conformité OWASP (Helmet, Rate Limiting).
* **Scalabilité** : L'architecture doit supporter une montée en charge horizontale (Stateless Backend).
* **Disponibilité** : Architecture conteneurisée (Docker) pour faciliter le déploiement et la résilience.

---

# CHAPITRE 3 : ARCHITECTURE ET CONCEPTION

## 3.1 Architecture Technique : 3-Tiers

Nous avons opté pour une architecture **MEAN Stack** (MongoDB, Express, Angular, Node.js) découplée.

* **Client (Frontend)** : Angular 19. Une SPA (Single Page Application) offrant une expérience fluide type "app native".
* **Serveur (Backend)** : Node.js avec Express. Une API REST stateless.
* **Données (Database)** : MongoDB.

**Pourquoi ce choix ?**
L'architecture découplée permet de développer et déployer le frontend et le backend indépendamment. Node.js, grâce à son architecture *Event-Driven Non-Blocking I/O*, est idéal pour gérer de nombreuses requêtes concurrentes (réservations simultanées) et des connexions WebSocket (Chat), contrairement à des modèles threadés classiques (PHP/Java) qui peuvent être plus lourds pour du temps-réel.

## 3.2 Modélisation des Données (NoSQL)

Le choix de **MongoDB** (NoSQL) est stratégique pour gérer le **polymorphisme** des services. Contrairement à SQL où un "Hébergement" et un "Cours de Cuisine" nécessiteraient des tables jointes complexes, MongoDB permet de stocker des documents flexibles.

**Schémas Principaux (Mongoose) :**

1. **User** : Gère l'identité, les rôles (RBAC), et la sécurité (password hash).
2. **Service** :
    * Contient un champ `location` de type **GeoJSON Point** pour permettre les requêtes géospatiales (`$near`).
    * Utilise des tableaux pour `timeSlots` et `availability` imbriqués.
3. **Booking** : Table de liaison riche. Contient l'état de la transaction (`paymentStatus`) et l'état du service (`status`).

*[Insérer Diagramme de Classe ici]*

## 3.3 Vue Dynamique : Machine à États (State Machine)

La gestion d'une réservation suit une machine à états stricte pour éviter les incohérences (ex: payer pour un créneau déjà pris).

**Transitions :**

1. `DRAFT` -> `PENDING` : Le client effectue le paiement (Stripe Hold).
2. `PENDING` -> `CONFIRMED` : L'hôte accepte la demande. Le slot est décrémenté définitivement.
3. `PENDING` -> `CANCELLED` : L'hôte refuse (ou timeout). Le paiement est relâché.

**Optimistic Locking** : Pour éviter les "Double Booking", nous vérifions la disponibilité du slot *au moment précis* de la création du PaymentIntent, et une seconde fois lors de la confirmation finale.

---

# CHAPITRE 4 : CHOIX TECHNOLOGIQUES

## 4.1 Frontend : Angular 19 & Signals

Nous avons choisi la dernière version d'Angular pour sa robustesse.

* **Signals** : Nouvelle primitive de réactivité qui remplace `Zone.js` pour une détection de changement granulaire, améliorant drastiquement les performances sur les dashboards complexes.
* **Components Standalone** : Réduit le "boilerplate" des NgModules, simplifiant l'architecture.

## 4.2 Backend : Node.js & Socket.io

Pour le Chat et les Notifications, le protocole HTTP classique (Request-Response) est inefficace (Polling). Nous utilisons **Socket.io** (WebSockets) pour établir un canal bidirectionnel persistant.
Cela permet :

* De notifier un hôte instantanément lors d'une réservation.
* De voir les messages de chat en temps réel sans rafraîchir la page.

---

# CHAPITRE 5 : RÉALISATION ET IMPLÉMENTATION

Ce chapitre détaille l'implémentation concrète des fonctionnalités clés du système.

## 5.1 Feature 1: Le "God Mode" (Dashboard Admin)

**Objectif** : Donner un contrôle total aux administrateurs pour modérer la plateforme.
**Challenge** : Agréger des données de collections différentes (Users, Services, Bookings) sans impacter les performances de la base de production.

**Solution** :
Côté Backend (`adminController.js`), nous utilisons l'Aggregation Framework de MongoDB pour calculer les stats directement en base de données plutôt que dans le code, ce qui est beaucoup plus rapide.

```javascript
// backend/src/controllers/adminController.js
exports.getDashboardStats = async (req, res, next) => {
    // Exécution parallèle des requêtes pour performance (Promise.all)
    const [users, services, bookings, totalRevenue] = await Promise.all([
        User.countDocuments(),
        Service.countDocuments(),
        Booking.countDocuments(),
        Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ])
    ]);
    
    res.status(200).json({
        status: 'success',
        data: { users, services, bookings, revenue: totalRevenue[0]?.total || 0 }
    });
};
```

## 5.2 Feature 2: Système de Réservation Temps-Réel

**Objectif** : Sécursier le paiement et notifier l'hôte immédiatement.
**Intégration Stripe** : Nous utilisons les `PaymentIntents`. Le backend génère un `client_secret` sécurisé, et le frontend finalise la transaction directement avec Stripe. Le serveur ne touche jamais aux données bancaires (sécurité PCI-DSS).

**Logique Socket.io** :
Une fois la réservation créée en base (`Booking.create`), nous émettons un événement.

```javascript
// backend/src/controllers/bookingController.js
// Après création de la réservation...
const io = req.app.get('io'); // Récupération de l'instance Socket
// On notifie la "room" privée de l'hôte
io.to(hostId).emit('new-booking', {
    bookingId: newBooking._id,
    touristName: req.user.name
});
```

## 5.3 Feature 3: Moteur de Recherche Géospatial

**Objectif** : "Trouver des services autour de moi".
**Solution** : Utilisation de l'opérateur `$near` de MongoDB sur l'index `2dsphere` créé sur le champ `location` du Service.

```javascript
// backend/src/controllers/serviceController.js
exports.getServicesWithin = async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    
    // Rayon de la Terre en radians
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const services = await Service.find({
        location: { 
            $geoWithin: { $centerSphere: [[lng, lat], radius] } 
        }
    });
    // ...
};
```

## 5.4 Feature 4: Internationalisation et IA

Pour rendre l'application accessible, nous utilisons `ngx-translate` pour le support Français/Anglais/Arabe.
De plus, nous avons intégré l'API **Google Gemini** pour offrir un assistant virtuel (`AiChat`) capable de répondre aux questions des touristes sur la culture marocaine.

---

# CHAPITRE 6 : QUALITÉ LOGICIELLE ET TESTS

## 6.1 Stratégie de Test

La qualité a été assurée à plusieurs niveaux :

* **Tests Unitaires (Unit Tests)** : Bien que limités par le temps, nous avons utilisé Jest pour tester les utilitaires critiques (calcul de prix, formateurs de date).
* **Tests d'Intégration** : Utilisation de Postman Collections pour simuler des scénarios complets (Login -> Search -> Book).
* **Seeding** : Un script `seedServices.js` a été développé pour peupler la base de données avec des données réalistes, permettant de tester la performance de l'affichage et de la pagination.

---

# CHAPITRE 7 : DÉPLOIEMENT ET DEVOPS

## 7.1 Pipeline CI/CD

Le projet est hébergé sur un dépôt GitHub.

* **Frontend** : Déployé sur Vercel/Netlify avec un hook automatique sur la branche `master`.
* **Backend** : Déployé sur un service Cloud (Render/Heroku/VPS).

## 7.2 Dockerisation

Nous avons créé un `Dockerfile` multi-stage pour optimiser l'image de production.

1. **Build Stage** : Installation des dépendances complètes et compilation TypeScript.
2. **Production Stage** : Copie uniquement des artefacts compilés (`dist/`) et des dépendances de production (`npm ci --only=production`), réduisant la taille de l'image finale et la surface d'attaque.

---

# CONCLUSION GÉNÉRALE ET PERSPECTIVES

Le projet **DKHOUL** a permis de répondre à la problématique initiale en proposant une plateforme fonctionnelle, sécurisée et moderne pour le tourisme marocain.

**Bilan Technique** : L'architecture MEAN s'est révélée performante. L'utilisation des WebSockets a apporté la fluidité nécessaire à l'expérience utilisateur, et l'intégration de Stripe a professionnalisé les échanges.
**Apports Personnels** : Ce projet a été l'occasion de maîtriser des concepts avancés comme l'architecture Microservices (préparatoire), la géolocalisation NoSQL, et la gestion d'état réactive avec Angular Signals.

**Perspectives d'avenir (Future Work)** :

1. **Application Mobile Native** : Développement d'une version React Native ou Flutter pour faciliter l'usage par les hôtes sur le terrain.
2. **Blockchain pour les Avis** : Utiliser un Smart Contract pour certifier que chaque avis correspond à une réservation réelle et payée, éliminant les faux avis.
3. **IA de Pricing Dynamique** : Analyser la demande saisonnière pour suggérer aux hôtes le prix optimal pour leurs services.

---
