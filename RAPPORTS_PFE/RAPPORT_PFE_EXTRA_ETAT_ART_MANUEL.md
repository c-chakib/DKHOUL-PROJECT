# MÉMOIRE DE PROJET DE FIN D'ÉTUDES

## PARTIE SUPLÉMENTAIRE : ÉTAT DE L'ART ET ÉTUDE TECHNOLOGIQUE

*(À insérer avant le Chapitre 3 : Architecture)*

---

# CHAPITRE X : ÉTAT DE L'ART ET ÉTUDE COMPARATIVE

Avant d'arrêter nos choix technologiques, il est impératif d'analyser les solutions existantes et de justifier nos décisions par une étude comparative rigoureuse. Ce chapitre explore les différentes architectures logicielles et les stacks technologiques modernes.

## X.1 Étude des Architectures Logicielles

### X.1.1 Architecture Monolithique

L'architecture monolithique regroupe toutes les fonctionnalités (Vues, Logique Métier, Accès Données) dans une seule base de code déployable.

* **Avantages** : Simplicité de développement initial, déploiement unique.
* **Inconvénients** : Difficile à maintenir quand le code grossit, technologie figée, scalabilité limitée (on doit dupliquer tout le bloc même si seul le module "Réservation" est sollicité).
* **Verdict pour DKHOUL** : **Rejetée**. La complexité métier du tourisme (Temps-réel, Paiement, Géoloc) nécessite une séparation des préoccupations.

### X.1.2 Architecture Microservices

L'application est découpée en petits services autonomes (Service Auth, Service Paiement, Service Chats) communiquant par réseau (HTTP/gRPC).

* **Avantages** : Scalabilité fine, liberté technologique par service, résilience (si le chat plante, le paiement fonctionne encore).
* **Inconvénients** : Complexité opérationnelle énorme (Orchestration, Latence réseau, Monitoring distribué).
* **Verdict pour DKHOUL** : **Nuancée**. Pour une équipe restreinte (PFE), le "Full Microservices" est trop lourd. Nous optons pour une **Architecture Modulaire Distribuée** (Frontend découplé + Backend API), qui est une étape intermédiaire pragmatique.

## X.2 Comparatif des Bases de Données (SQL vs NoSQL)

Le choix de la persistance est critique pour une marketplace.

| Critère | SQL (PostgreSQL, MySQL) | NoSQL (MongoDB) |
| :--- | :--- | :--- |
| **Schéma** | Rigide (Tables, Colonnes fixes). Idéal pour données structurées. | Flexible (Documents JSON). Idéal pour données hétérogènes. |
| **Relations** | Fortes (Jointures JOIN). Garantit l'intégrité référentielle. | Faibles (Références ObjectId). Demande de gérer la cohérence au niveau applicatif. |
| **Scalabilité** | Verticale (Plus gros serveur). Difficile à clusteriser (Sharding complexe). | Horizontale (Sharding natif). Conçu pour le Big Data. |
| **Géolocalisation** | Extensions (PostGIS). Puissant mais verbeux. | Native (2dsphere). Opérateurs `$near` simples et performants. |

**Conclusion** : Nous avons choisi **MongoDB**.

* *Raison 1* : Un "Service" touristique est polymorphe. Un cours de cuisine a une liste d'ingrédients, une randonnée a un dénivelé. Le format JSON schemaless permet de stocker ces différences sans créer 50 tables vides.
* *Raison 2* : La performance de lecture pour le moteur de recherche géospatial est supérieure pour nos cas d'usage simples (Rayon X km).

## X.3 Comparatif des Stacks Web (Back & Front)

### X.3.1 Backend : PHP (Laravel) vs Python (Django) vs Node.js

* **PHP/Laravel** : Très mature, mais modèle threadé bloquant (1 requête = 1 thread). Moins adapté aux connexions persistantes (WebSockets/Chat).
* **Python/Django** : Excellent pour l'IA et la Data Science, mais peut être plus lent à l'exécution que Node.js (V8 Engine).
* **Node.js (Choix retenu)** :
  * **Non-blocking I/O** : Parfait pour gérer des milliers de connexions simultanées (utilisateurs en attente de confirmation).
  * **Isomorphisme** : Même langage (JS/TS) côté client et serveur, facilitant le développement Fullstack.

### X.3.2 Frontend : React vs Angular vs Vue

* **React** : Librairie (pas framework). Très flexible mais demande de choisir ses briques (Router, State, HTTP). Risque de "Spaghetti code" si mal structuré.
* **Angular (Choix retenu)** : Framework "Batteries Included".
  * Structure imposée (Modules, Services, Composants) idéale pour la maintenabilité d'un gros projet.
  * **TypeScript natif** : Sécurité du typage indispensable pour les objets complexes (Réservations, Transactions).
  * **Performance (v19)** : L'arrivée des **Signals** rend Angular extrêmement performant pour les mises à jour UI temps-réel (Tableaux de bord temps réel).

---

# CHAPITRE Y : MANUEL UTILISATEUR ET GUIDE DE DÉPLOIEMENT

*(À insérer en toute fin)*

## Y.1 Guide de Déploiement (DevOps)

### Prérequis

* Node.js v20+
* MongoDB v7.0
* Clés API (Stripe, Google Gemini, Cloudinary)

### Installation Locale

1. Cloner le dépôt : `git clone https://github.com/dkhoul/repo.git`
2. Backend :

    ```bash
    cd backend
    npm install
    npm run dev
    ```

3. Frontend :

    ```bash
    cd frontend
    npm install
    ng serve
    ```

## Y.2 Manuel Utilisateur (Scénarios)

### Scénario 1 : Devenir Hôte

1. S'inscrire via le bouton "Devenir Hôte" en haut à droite.
2. Compléter le profil (Photo obligatoire pour la confiance).
3. Cliquer sur "Créer un Service".
    * *Étape 1* : Remplir Titre et Description (L'IA peut vous aider).
    * *Étape 2* : Uploader 4 belles photos.
    * *Étape 3* : Définir le prix et la localisation sur la carte interactive.
4. Votre service est maintenant visible sur la Marketplace.

### Scénario 2 : Réserver une Expérience

1. Sur la Home Page, utiliser la barre de recherche : "Marrakech" + "Cuisine".
2. Filtrer par prix (slider).
3. Cliquer sur une carte pour voir les détails.
4. Sélectionner une date dans le calendrier.
5. Procéder au paiement par Carte Bancaire (Interface Stripe Sécurisée).
6. Une fois payé, vous accédez au Chat avec l'hôte.

---
