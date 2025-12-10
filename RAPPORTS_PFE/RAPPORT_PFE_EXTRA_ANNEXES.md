# ANNEXES : CODES SOURCES PRINCIPAUX

Pour permettre une reproduction et une analyse approfondie des travaux, nous fournissons ici l'intégralité du code source des modules critiques de l'application **DKHOUL**.

---

## ANNEXE A : BACKEND - CONTRÔLEURS

### A.1 Contrôleur de Réservation (BookingController.js)

Ce fichier gère la logique complexe des paiements Stripe et des notifications Socket.io.

```javascript
/* backend/src/controllers/bookingController.js */
const Stripe = require('stripe');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const AppError = require('../utils/appError');
// ... (Voir fichier original pour les imports complets)

exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { serviceId, price, date, time, guests, duration } = req.body;

        if (!serviceId || !price) {
            return next(new AppError('Please provide serviceId and price', 400));
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return next(new AppError('Service not found', 404));
        }

        // Logic de vérification de disponibilité
        if (date) {
            const requestedDate = new Date(date);
            requestedDate.setHours(0, 0, 0, 0);
            const slot = service.availability.find(a => {
                const slotDate = new Date(a.date);
                slotDate.setHours(0, 0, 0, 0);
                return slotDate.getTime() === requestedDate.getTime();
            });
            if (slot && slot.slots <= 0) {
                return next(new AppError('Créneau complet ou indisponible', 400));
            }
        }

        const amount = Math.round(price * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'mad',
            automatic_payment_methods: { enabled: true },
            metadata: {
                serviceId: serviceId,
                userId: req.user.id
            }
        });

        const newBooking = await Booking.create({
            tourist: req.user.id,
            service: serviceId,
            price: price,
            status: 'pending',
            paymentIntentId: paymentIntent.id,
            bookingDate: date || null,
            time: time || null,
            guests: guests || 1
        });

        // Notification Hôte
        const fullService = await Service.findById(serviceId).populate('host');
        if (fullService && fullService.host) {
             const emailModule = require('../utils/email');
             await emailModule.sendNewRequestToHost(fullService.host, req.user, newBooking, fullService);
        }

        res.status(200).json({
            status: 'success',
            clientSecret: paymentIntent.client_secret,
            bookingId: newBooking._id
        });

    } catch (error) {
        next(new AppError(`Payment processing failed: ${error.message}`, 500));
    }
};
// ... (Reste du fichier)
```

### A.2 Contrôleur de Services (ServiceController.js)

Gère la recherche géospatiale et le CRUD.

```javascript
/* backend/src/controllers/serviceController.js */
const Service = require('../models/Service');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getServicesWithin = async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    const services = await Service.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: services.length,
        data: { data: services }
    });
};
// ... (Reste du fichier)
```

---

## ANNEXE B : FRONTEND - COMPOSANTS CLÉS

### B.1 Marketplace Component (Logique de recherche)

```typescript
/* frontend/src/app/features/marketplace/marketplace.component.ts */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// ... imports

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, MatIconModule, FormsModule]
})
export class MarketplaceComponent implements OnInit {
    services = signal<Service[]>([]);
    isLoading = signal<boolean>(true);
    searchQuery = signal<string>('');
    
    // ... Logique Signals et RxJS
}
```

---

## ANNEXE C : MODÈLES DE DONNÉES (MONGOOSE)

### C.1 Modèle Utilisateur (User.js)

```javascript
/* backend/src/models/User.js */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please tell us your name!'] },
    email: { 
        type: String, 
        required: [true, 'Please provide your email'], 
        unique: true, 
        lowercase: true, 
        validate: [validator.isEmail, 'Please provide a valid email'] 
    },
    photo: String,
    role: { type: String, enum: ['user', 'guide', 'lead-guide', 'admin'], default: 'user' },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 8, select: false },
    passwordConfirm: { type: String, required: [true, 'Please confirm your password'] },
    active: { type: Boolean, default: true, select: false }
});

// Encryption logic
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

module.exports = mongoose.model('User', userSchema);
```
