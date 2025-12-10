# MÉMOIRE DE PROJET DE FIN D'ÉTUDES

## PARTIE 1 : CADRAGE ET ANALYSE (Chapitres 1 & 2)

---

# INTRODUCTION GÉNÉRALE

Le secteur du tourisme constitue l'un des piliers fondamentaux de l'économie marocaine, contribuant de manière significative au Produit Intérieur Brut (PIB) et à la création d'emplois. Cependant, ce secteur traverse aujourd'hui une période de mutation profonde, exacerbée par l'évolution rapide des technologies de l'information et le changement des habitudes de consommation mondiales.

Le modèle traditionnel, longtemps dominé par les grands complexes hôteliers et les circuits fermés ("All-inclusive"), montre ses limites. Les voyageurs contemporains, en particulier les générations Y et Z, ne se contentent plus d'être de simples spectateurs. Ils recherchent du sens, de l'authenticité et une immersion réelle dans la culture locale. On parle alors de l'avènement de l'**Économie de l'Expérience**. Le voyageur ne veut plus seulement "visiter" Marrakech ; il veut apprendre à cuisiner un tajine avec une famille locale, s'initier à la poterie traditionnelle à Fès, ou découvrir des randonnées méconnues dans l'Atlas avec un guide du village.

Malheureusement, l'infrastructure numérique marocaine actuelle peine à répondre efficacement à cette demande spécifique. Le marché reste fragmenté : d'un côté, des plateformes internationales standardisées (Airbnb Experiences, TripAdvisor) qui imposent des commissions prohibitives (souvent supérieures à 20-25%) et des critères d'entrée rigides, excluant de facto une grande partie des petits prestataires locaux. De l'autre, un marché informel dynamique mais chaotique, s'appuyant sur des réseaux sociaux (Instagram, WhatsApp) ou le bouche-à-oreille, sans aucune garantie de sécurité, de qualité ou de fiabilité transactionnelle.

C'est dans cette brèche que s'insère le projet **DKHOUL**.

**DKHOUL** se définit comme une place de marché ("Marketplace") numérique souveraine, conçue pour reconnecter directement les visiteurs avec les talents locaux. Notre ambition est double : offrir une vitrine technologique de pointe aux hôtes marocains (artisans, guides, passionnés) pour valoriser leur savoir-faire, et garantir aux voyageurs une expérience fluide, sécurisée et transparente.

Ce mémoire de fin d'études a pour objet de présenter la démarche d'ingénierie complète ayant conduit à la réalisation de cette plateforme. Il ne s'agit pas seulement de documenter du code, mais de démontrer comment une architecture technique rigoureuse (MEAN Stack, Microservices partiels, Temps-réel) peut résoudre des problématiques humaines et économiques concrètes.

Le présent document est structuré comme suit :

* Le **Premier Chapitre** posera le contexte général et définira la problématique précise.
* Le **Deuxième Chapitre** détaillera l'analyse des besoins et les spécifications foncionnelles.
* Les chapitres suivants (traités dans les parties ultérieures) aborderont la conception architecturale, les choix technologiques, la mise en œuvre et enfin la stratégie de validation.

---

# CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE

## 1.1 Le Tourisme Marocain : Un Géant aux Pieds d'Argile ?

Si le Maroc a accueilli un nombre record de touristes ces dernières années (dépassant la barre des 13-14 millions), la répartition de la valeur ajoutée reste inégale. Le tourisme de masse tend à concentrer les richesses dans les mains de quelques grands opérateurs, tandis que les acteurs locaux—ceux qui créent véritablement la "couleur locale"—ne perçoivent souvent que des miettes.

### 1.1.1 La Montée du Tourisme Expérientiel

Le "Tourisme Expérientiel" n'est pas une mode passagère, c'est une tendance structurelle lourde. Selon les études de marché (ex: Skift Research), plus de 65% des voyageurs privilégient désormais les expériences sur les biens matériels.
Au Maroc, cela se traduit par une demande explosive pour :

* **L'Artisanat participatif** : Ne pas juste acheter un tapis, mais apprendre à le tisser.
* **Gastronomie** : Cours de cuisine, "Food tours" dans les souks.
* **Aventure douce** : Excursions hors des sentiers battus.

### 1.1.2 Le Fossé Numérique (Digital Divide)

Le problème majeur est l'accessibilité. Un artisan potier de Safi ou une coopérative féminine d'Argan à Essaouira n'ont souvent pas les compétences ou les moyens pour maintenir un site web professionnel, gérer un système de réservation temps-réel, ou sécuriser des paiements en ligne. Ils se retrouvent dépendants d'intermédiaires coûteux ou se limitent à une visibilité locale physique.

## 1.2 Analyse de l'Offre Existante (Benchmarking)

| Solution | Avantages | Inconvénients majeurs |
| :--- | :--- | :--- |
| **Airbnb Experiences** | Visibilité mondiale, confiance. | Commissions très élevées (20%), Processus de validation très lourd et lent, Standardisation à l'extrême. |
| **Instagram / WhatsApp** | Gratuit, direct, très populaire au Maroc. | Aucune sécurité de paiement (cash only), Pas de gestion de calendrier (surbooking fréquent), Pas de contrat/assurance. |
| **Agences Locales** | Service clé en main. | Prix souvent doublés ou triplés, Manque de flexibilité, Faible numérisation (réservation par téléphone/email). |

## 1.3 La Problématique d'Ingénierie

Au-delà de l'aspect commercial, le défi est technique. Construire une plateforme capable de gérer cette hétérogénéité de services est complexe.
Contrairement à la vente de produits (e-commerce classique) ou la location d'hôtels (dates fixes), la vente d'expériences implique des contraintes temporelles fines (créneaux horaires), des géolocalisations variables, et une interaction sociale forte avant l'achat.

Notre problématique centrale peut donc se formuler ainsi :

> **"Comment concevoir une architecture web scalable, résiliente et sécurisée, capable de modéliser l’hétérogénéité des services touristiques (Skill, Space, Connect) et de garantir la confiance transactionnelle en temps réel entre des acteurs anonymes ?"**

Cette problématique se décline en sous-questions techniques :

1. **Modélisation** : Comment stocker efficacement des données très variées (un cours de cuisine a des "ingrédients", une randonnée a un "dénivelé") dans une base de données performante ?
2. **Temps-Réel** : Comment gérer la concurrence d'accès (plusieurs personnes réservant le même créneau simultanément) sans créer de conflits (Race Conditions) ?
3. **Sécurité** : Comment protéger l'application contre les attaques courantes (XSS, NoSQL Injection) tout en maintenant une expérience utilisateur fluide ?

---

# CHAPITRE 2 : ANALYSE ET SPÉCIFICATIONS

## 2.1 Identification des Acteurs (Personas)

Pour concevoir **DKHOUL**, nous avons identifié trois acteurs principaux interagissant avec le système.

### 2.1.1 Le Voyageur ("Guest")

C'est l'utilisateur final, souvent un touriste international ou un local explorant son propre pays.

* **Profil** : Connecté, exigeant sur l'UX, impatient, soucieux de la sécurité de ses données bancaires.
* **Besoin clé** : "Je veux trouver une activité authentique à faire *demain* à *Marrakech*, réserver instantanément et être sûr que le prestataire sera là."

### 2.1.2 L'Hôte ("Host")

C'est le prestataire de service. Il peut être un professionnel ou un particulier.

* **Profil** : Expert dans son domaine mais pas forcément à l'aise avec l'outil informatique complexe.
* **Besoin clé** : "Je veux remplir mes créneaux vides, être payé en toute sécurité sans courir après les virements, et gérer mon calendrier simplement."

### 2.1.3 L'Administrateur ("Admin/SuperAdmin")

Il garantit la qualité et la sécurité de la plateforme.

* **Besoin clé** : "Je veux une vue d'aigle (God Mode) sur l'activité pour détecter les fraudes, modérer les contenus inappropriés et suivre la croissance."

## 2.2 Analyse des Besoins Fonctionnels

L'analyse a permis d'extraire les fonctionnalités critiques suivantes, priorisées selon la méthode MoSCoW (Must has, Should have, Could have).

### 2.2.1 Module : Recherche et Découverte (Search Engine)

* **[MUST] Recherche Géospatiale** : Le système doit permettre de trouver des services dans un rayon de X km autour d'un point GPS ou d'une ville.
* **[MUST] Filtrage Multicritères** : Filtrer par Prix (Min/Max), Catégorie (Art, Sport, Détente), Langue parlée.
* **[SHOULD] Recherche Full-Text** : Recherche par mots-clés dans les descriptions et titres (ex: "Poterie", "Surf").

### 2.2.2 Module : Réservation et Paiement (Booking Core)

Ce module est le cœur critique de l'application.

* **[MUST] Vérification de Disponibilité** : Le système doit empêcher la réservation d'un créneau déjà complet (Gestion de Stock).
* **[MUST] Paiement Sécurisé** : Intégration d'une passerelle de paiement (Stripe) conforme PCI-DSS. Le flux doit supporter la pré-autorisation (Hold) puis la capture (Capture) une fois la réservation confirmée.
* **[SHOULD] Workflow d'Approbation** : Un hôte doit pouvoir accepter ou refuser une demande de réservation (mode "Request to Book").

### 2.2.3 Module : Communication (Social)

* **[MUST] Messagerie Instantanée** : Un chat privé entre Hôte et Invité pour lever les doutes avant achat.
* **[MUST] Notifications Temps-Réel** : L'hôte doit être notifié (Push/Socket) *immédiatement* lors d'une nouvelle demande.

## 2.3 Exigences Non-Fonctionnelles (Qualité de Service)

Les exigences non-fonctionnelles définissent "comment" le système doit se comporter. Elles sont souvent aussi critiques que les fonctionnalités elles-mêmes.

### 2.3.1 Performance (Latence et Fluidité)

Le tourisme étant un secteur où l'image compte, la lenteur est intolérable.

* **Objectif** : Temps de chargement initial (First Contentful Paint) < 1.5 secondes.
* **Contrainte** : Les réponses API (Backend) doivent être inférieures à 200ms pour les lectures simples.
* **Moyen** : Utilisation d'Angular (SPA) pour la fluidité, Indexation DB, Cache (Redis envisagé).

### 2.3.2 Sécurité (Confidentialité et Intégrité)

* **Authentification** : Utilisation impérative de **JWT (JSON Web Tokens)** pour une authentification stateless et scalable.
* **Sanitisation** : Protection stricte contre les injections NoSQL (MongoDB est vulnérable aux objets `$gt`, `$ne` malicieux dans les requêtes JSON) et les failles XSS (Cross-Site Scripting).
* **Chiffrement** : Tous les mots de passe doivent être hachés (bcrypt) avec un coût de calcul suffisant (salt rounds >= 12). HTTPS obligatoire.

### 2.3.3 Scalabilité et Disponibilité

L'architecture doit être prévue pour grandir ("Scale").

* **Horizontal Scaling** : Le backend doit être "Stateless" (pas de session stockée en RAM serveur) pour permettre de multiplier les instances de serveurs (Docker Containers) derrière un Load Balancer si le trafic augmente.

---
*(Fin de la Partie 1 - La suite dans le document technique d'architecture)*
