# PRÉSENTATION DE SOUTENANCE PFE (PowerPoint Outline)

**Temps estimé :** 20 minutes
**Slides :** ~15-20 Diapositives

---

## SLIDE 1 : Titre

**Titre du Projet :** DKHOUL - Plateforme de Tourisme Expérientiel
**Sous-titre :** Démocratiser l'accès au marché touristique numérique pour les locaux.
**Présenté par :** [Votre Nom]
**Encadré par :** [Nom de l'Encadrant]
**Année Universitaire :** 2024-2025

---

## SLIDE 2 : Plan de la Présentation

1. Contexte & Problématique
2. Analyse des Besoins
3. Architecture Technique
4. Conception & Modélisation
5. Réalisation & Démonstration
6. Conclusion & Perspectives

---

## SLIDE 3 : Contexte - L'Évolution du Tourisme

* **Constat :** Le tourisme de masse ("All-inclusive") décline au profit de l'**Économie de l'Expérience** (Culture, Artisanat, Nature).
* **Chiffres clés :** +65% des voyageurs cherchent l'immersion (Skift).
* **Le Problème :**
  * *Acteurs Internationaux (Airbnb)* : Commissions élevées (20%), Barrière à l'entrée.
  * *Marché Informel* : Insécurité, Pas de paiement en ligne, Arnaques.

---

## SLIDE 4 : Problématique Ingénieur
>
> "Comment concevoir une place de marché **temps-réel**, **sécurisée** et **scalable**, capable de gérer des services hétérogènes (Logement, Atelier, Social) ?"

* **Défis :**
  * Hétérogénéité des données (NoSQL).
  * Concurrence d'accès (Double Booking).
  * Confiance numérique (Paiement & Validations).

---

## SLIDE 5 : Acteurs & Fonctionnalités Clés

* **👥 Voyageur (Guest)**
  * Recherche Géolocalisée (Rayon km).
  * Paiement Sécurisé (Stripe).
  * Chat avec l'Hôte.
* **🏠 Hôte (Host)**
  * Gestion de Calendrier (Disponibilités).
  * Workflow d'Approbation (Accept/Reject).
* **🛡️ Admin**
  * Dashboard Global (God Mode).
  * Modération.

---

## SLIDE 6 : Architecture Globale (3-Tiers)

* **Approche :** Découplée (Stateless API).
* **Stack Technique : MEAN**
  * **Frontend :** Angular 19 (Performance, Signals).
  * **Backend :** Node.js + Express (Non-blocking I/O).
  * **Database :** MongoDB (NoSQL, Flexibilité).

*[Insérer ici le schéma d'architecture globale]*

---

## SLIDE 7 : Pourquoi le NoSQL ? (MongoDB)

* **Problème SQL :** Structures rigides. Un "Cours de Cuisine" ≠ "Randonnée".
* **Solution NoSQL (Document) :**
  * Flexibilité du schéma (Polymorphisme).
  * **Géolocalisation Native :** Index `2dsphere` pour les requêtes de proximité (`$near`, `$geoWithin`).
  * Performance en lecture (Agrégation).

---

## SLIDE 8 : Conception Dynamique

* **Gestion de la Concurrence (Booking) :**
  * Vérification Atomique de la disponibilité.
  * Machine à États : `Draft` -> `Pending` -> `Confirmed` | `Cancelled`.
* **Flux de Paiement :**
  * Utilisation des **PaymentIntents** Stripe (Pré-autorisation).
  * Le serveur ne stocke jamais les données bancaires (Conformité PCI-DSS).

---

## SLIDE 9 : Réalisation - Zoom sur le Temps-Réel

* **Besoin :** Chat Instantané & Notifications Hôte.
* **Technologie :** **Socket.io** (WebSockets).
* **Avantage :** Connexion bidirectionnelle persistante vs HTTP Polling (Latence réduite, Charge serveur optimisée).

---

## SLIDE 10 : Réalisation - L'Assistant IA "Chakib"

* **Innovation :** Intégration de l'IA Générative (**Google Gemini API**).
* **Fonction :** Guide touristique virtuel 24/7.
* **Implémentation :**
  * *System Prompting* : Définition de la "Personnalité" (Guide Marocain).
  * Maintenance du contexte conversationnel.

---

## SLIDE 11 : Démonstration (Scénario)

*(Prévoir une vidéo ou des screenshots pour ces étapes)*

1. **Recherche :** "Poterie à Fès" sur la carte.
2. **Réservation :** Sélection d'un créneau -> Paiement CB.
3. **Notification :** L'hôte reçoit l'alerte instantanée.
4. **Chat :** Discussion "Où est le point de rendez-vous ?".
5. **Admin :** Vue sur le dashboard des revenus.

---

## SLIDE 12 : Qualité & DevOps

* **Tests :** Isolation stricte (Base de Test vs Base de Prod).
* **CI/CD :** Déploiement automatisé (GitHub -> Vercel/Render).
* **Sécurité :**
  * Protection Injection NoSQL.
  * JWT (Tokens) pour l'authentification stateless.
  * Hachage des mots de passe (Bcrypt).

---

## SLIDE 13 : Conclusion & Perspectives

* **Bilan :** Plateforme fonctionnelle, prête pour la "Beta". Objectifs techniques atteints.
* **Limitations actuelles :** Pas d'application mobile native.
* **Perspectives :**
    1. 📱 **App Mobile** (React Native) pour les hôtes sur le terrain.
    2. 🔗 **Blockchain** pour certifier les avis (Lutte contre les faux avis).
    3. 💰 **Pricing Dynamique** par IA.

---

## SLIDE 14 : Q&A

**Merci de votre attention.**
*Avez-vous des questions ?*
