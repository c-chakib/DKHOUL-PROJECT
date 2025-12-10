# MÉMOIRE DE PROJET DE FIN D'ÉTUDES

## PARTIE 3 : RÉALISATION ET IMPLÉMENTATION (Chapitre 5)

---

# CHAPITRE 5 : RÉALISATION TECHNIQUE

Ce chapitre constitue le cœur "ingénierie" du mémoire. Il détaille la traduction des spécifications fonctionnelles (Chapitre 2) et architecturales (Chapitre 3) en code source concret. Nous nous focaliserons sur l'implémentation de quatre fonctionnalités critiques qui illustrent la complexité technique du projet **DKHOUL**.

## 5.1 FEATURE 1 : Le "Super Admin Dashboard" (Gestion des Données)

### 5.1.1 Objectif

Permettre à l'administrateur de surveiller la santé de la plateforme en temps réel (revenus, nouveaux utilisateurs) et d'agir sur les ressources (utilisateurs, signalements).

### 5.1.2 Challenge Technique

Agréger des données provenant de collections volumineuses (`Bookings`, `Users`, `Services`) sans impacter les performances de l'application. Une approche naïve avec des boucles `for` en JavaScript serait trop lente et gourmande en mémoire (O(n)).

### 5.1.3 Solution : MongoDB Aggregation Framework

Nous avons déporté la logique de calcul directement vers le moteur de base de données en utilisant le **Pipeline d'Agrégation** de MongoDB. Cette approche permet de filtrer et grouper les données nativement en C++.

**Extrait du code Backend (`controllers/adminController.js`) :**

```javascript
exports.getDashboardStats = async (req, res, next) => {
    try {
        // Exécution en parallèle des requêtes indépendantes via Promise.all pour réduire la latence totale
        const [usersCount, revenueStats, bookingsCount] = await Promise.all([
            User.countDocuments(),
            // Agrégation complexe: Calcul du Chiffre d'Affaires total
            Booking.aggregate([
                { $match: { paymentStatus: 'paid' } }, // Filtre : Seules les réservations payées
                { $group: { _id: null, totalRevenue: { $sum: '$price' } } } // Somme des prix
            ]),
            Booking.countDocuments()
        ]);

        const revenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

        res.status(200).json({
            status: 'success',
            data: { 
                revenue, 
                usersCount, 
                bookingsCount 
            }
        });
    } catch (err) {
        next(err);
    }
};
```

---

## 5.2 FEATURE 2 : Système de Réservation Temps-Réel (Transactionnel)

### 5.2.1 Objectif

Garantir qu'une réservation est payée, enregistrée, et notifiée à l'hôte instantanément, sans risque de double réservation (Overbooking).

### 5.2.2 Challenge Technique

La coordination entre le paiement (Stripe), la base de données (MongoDB) et la notification (Socket.io) doit être atomique au sens métier.

### 5.2.3 Solution Implémentée

**1. Modèle de Données (`models/Booking.js`)**
Le statut de paiement est découplé du statut de la réservation pour gérer le workflow d'approbation.

```javascript
/* Extrait du Schéma Mongoose */
const bookingSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'], // État vis à vis de l'hôte
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'refunded'], // État financier
        default: 'paid' // Au moment de la création, c'est déjà payé via Stripe
    },
    paymentIntentId: { type: String } // Référence Stripe pour remboursement futur
});
```

**2. Contrôleur de Réservation (`controllers/bookingController.js`)**
Nous créons d'abord l'intention de paiement. Une fois confirmée côté client, nous enregistrons la réservation et émettons un événement WebSocket.

```javascript
exports.createPaymentIntent = async (req, res, next) => {
    // 1. Double Vérification de la disponibilité (Anti-Race Condition)
    // ... (Code de vérification ...)

    // 2. Création du Payment Intent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100), // En centimes
        currency: 'mad',
        metadata: { serviceId, userId: req.user.id }
    });

    // 3. Création de la réservation (État Pending)
    const newBooking = await Booking.create({ ...req.body, paymentIntentId: paymentIntent.id });

    // 4. Notification Temps-Réel (Socket.io)
    // On récupère le service complet pour avoir l'ID de l'hôte
    const fullService = await Service.findById(serviceId).populate('host');
    
    // Lazy loading du module Email pour éviter les dépendances circulaires
    const emailModule = require('../utils/email'); 
    
    // Envoi asynchrone (ne bloque pas la réponse HTTP)
    emailModule.sendNewRequestToHost(fullService.host, req.user, newBooking, fullService)
        .catch(err => console.error('Email failed', err));

    res.status(200).json({ status: 'success', clientSecret: paymentIntent.client_secret });
};
```

---

## 5.3 FEATURE 3 : Moteur de Recherche Géospatial

### 5.3.1 Objectif

Permettre aux utilisateurs de trouver des expériences *autour d'eux* (ex: "Rayon de 10km") ou dans une ville spécifique.

### 5.3.2 Challenge Technique

Calculer la distance entre des milliers de points GPS à la volée est coûteux en CPU si on le fait sans indexation.

### 5.3.3 Solution : Indexation 2dsphere

Nous utilisons l'index spatial natif de MongoDB.

**Indexation (`models/Service.js`) :**

```javascript
serviceSchema.index({ location: '2dsphere' }); // Création de l'index géospatial
```

**Contrôleur de Recherche de Proximité (`controllers/serviceController.js`) :**
L'opérateur `$geoWithin` avec `$centerSphere` permet de filtrer les résultats dans un cercle défini par [Longitude, Latitude] et un Rayon (normalisé par le rayon de la Terre).

```javascript
exports.getServicesWithin = async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Conversion de la distance en radians (Rayon Terrestre ~6378 km)
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const services = await Service.find({
        location: { 
            $geoWithin: { 
                $centerSphere: [[lng, lat], radius] 
            } 
        }
    });

    res.status(200).json({ results: services.length, data: { services } });
};
```

---

## 5.4 FEATURE 4 : Intelligence Artificielle (Assistant Virtuel "Chakib")

### 5.4.1 Objectif

Offrir une assistance culturelle 24/7 aux touristes grâce à l'IA Générative, capable de répondre en contexte ("Quel est le meilleur moment pour visiter ce service ?").

### 5.4.2 Challenge Technique

Intégrer un LLM (Large Language Model) tout en gardant le contexte de la conversation utilisateur.

### 5.4.3 Solution : Google Gemini API

Nous avons intégré l'API **Google Gemini 2.0 Flash** pour sa rapidité et son coût réduit. Nous avons implémenté un système de **System Instruction** robuste pour définir la personnalité du bot ("Chakib, guide marocain").

**Code d'Intégration (`controllers/aiController.js`) :**

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chatWithGuide = async (req, res, next) => {
    // 1. Récupération de l'historique de conversation de l'utilisateur
    let chat = await AiChat.findOne({ user: req.user.id });
    
    // 2. Définition du Persona (System Prompt)
    const systemInstruction = `You are CHAKIB, a friendly and expert Moroccan tourism guide for the DKHOUL platform. 
    You speak French and English. You help tourists find activities and understand Moroccan culture.
    Tone: Warm, welcoming, and slightly poetic.`;

    // 3. Appel API Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chatSession = model.startChat({
        history: [
            { role: "user", parts: [{ text: `System Instruction: ${systemInstruction}` }] },
            ...chat.history.map(h => ({ role: h.role, parts: h.parts })) // Injection du contexte passé
        ]
    });

    const result = await chatSession.sendMessage(req.body.message);
    const replyText = result.response.text();

    // 4. Sauvegarde de la réponse pour le futur contexte
    chat.history.push({ role: 'user', parts: [{ text: req.body.message }] });
    chat.history.push({ role: 'model', parts: [{ text: replyText }] });
    await chat.save();

    res.status(200).json({ data: { reply: replyText } });
};
```

---
*(Fin de la Partie 3 - La suite concernera la Qualité, les Tests et le DevOps)*
