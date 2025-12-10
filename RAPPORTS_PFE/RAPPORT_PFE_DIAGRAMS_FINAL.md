# ANNEXE : DIAGRAMMES UML (VERSION FINALE & CORRIGÉE)

Ce document regroupe l'ensemble des diagrammes techniques corrigés pour garantir une compatibilité maximale (Syntaxe Standard Mermaid).

---

## 1. DIAGRAMME D'ARCHITECTURE SYSTÈME (Global View)
*Représentation de l'architecture 3-Tiers et des flux de données.*

```mermaid
graph TD
    subgraph Client ["CLIENT (Frontend)"]
        Browser["Navigateur Web (Angular SPA)"]
    end

    subgraph Cloud ["INFRASTRUCTURE CLOUD"]
        LB["Load Balancer / Reverse Proxy"]
        
        subgraph Backend ["BACKEND (Node.js Cluster)"]
            API["API REST (Express)"]
            Socket["Socket.io (Temps Réel)"]
        end
        
        subgraph Data ["DATA LAYER"]
            MongoMaster[("MongoDB Primary")]
            MongoSlave[("MongoDB Secondary")]
        end
    end

    subgraph External ["SERVICES EXTERNES"]
        Stripe["Stripe (Paiement)"]
        Gemini["Google Gemini (IA)"]
        Cloudinary["Cloudinary (CDN Images)"]
    end

    Browser -- "HTTPS / JSON" --> LB
    Browser -- "WebSocket (WSS)" --> LB
    LB --> API
    LB --> Socket
    
    API -- "Mongoose" --> MongoMaster
    MongoMaster -. "Replication" .-> MongoSlave
    
    API -- "API Call" --> Stripe
    API -- "API Call" --> Gemini
    API -- "Upload" --> Cloudinary
```

---

## 2. DIAGRAMME DE CAS D'UTILISATION DÉTAILLÉ (Réservation)
*Zoom sur le processus "Réserver un Service" avec les extensions et exceptions.*

```mermaid
graph LR
    Guest((Voyageur))
    Host((Hôte))
    Systeme(Système DKHOUL)

    rect_main[Cadre : Processus de Réservation]
    
    Guest --> Search["Rechercher une Activité"]
    Guest --> Select["Sélectionner Date/Heure"]
    Guest --> Pay["Payer (Pré-autorisation)"]
    
    Pay --> Check{"Disponibilité ?"}
    Check -- "Non" --> Error["Afficher Erreur (Complet)"]
    Check -- "Oui" --> Create["Créer Réservation (Pending)"]
    
    Create --> Notify["Notifier Hôte (Email+Socket)"]
    Notify --> HostAction{"Action Hôte"}
    
    HostAction -- "Accepter" --> Confirm["Confirmer Réservation"]
    Confirm --> Charge["Capturer Paiement"]
    Confirm --> EmailGuest["Envoyer Billet"]
    
    HostAction -- "Refuser / Timeout" --> Cancel["Annuler Réservation"]
    Cancel --> Refund["Débloquer Fonds (Stripe)"]
    Cancel --> EmailGuestCancel["Notifier Annulation"]
```

---

## 3. DIAGRAMME DE CLASSES COMPLET
*Le modèle de données exhaustif.*

```mermaid
classDiagram
    %% Relations
    User "1" --> "0..*" Service : Creates
    User "1" --> "0..*" Booking : Books
    User "1" --> "0..*" Review : Writes
    User "1" --> "0..*" Message : Sends
    Service "1" --> "0..*" Booking : Has
    Service "1" --> "0..*" Review : Receives
    Booking "1" --> "1" Review : Enables

    class User {
        +ObjectId _id
        +String name
        +String email
        +String passwordHash
        +String role : [user, host, admin]
        +String photo
        +Date createdAt
        +comparePassword(pwd)
    }

    class Service {
        +ObjectId _id
        +ObjectId host
        +String title
        +String description
        +Number price
        +String category : [SKILL, SPACE, CONNECT]
        +String[] images
        +GeoJSON location
        +String city
        +Object[] availability
        +Number ratingAverage
        +Number ratingCount
        +calculateAvailability(date)
    }

    class Booking {
        +ObjectId _id
        +ObjectId tourist
        +ObjectId service
        +Date bookingDate
        +String status : [pending, confirmed, cancelled]
        +String paymentStatus : [paid, refunded]
        +String stripePaymentIntentId
        +Number pricePaid
    }

    class Review {
        +ObjectId _id
        +ObjectId service
        +ObjectId user
        +Number rating : [1-5]
        +String comment
        +Date createdAt
    }

    class Message {
        +ObjectId _id
        +ObjectId sender
        +ObjectId receiver
        +String content
        +Boolean isRead
        +Date timestamp
    }
```

---

## 4. DIAGRAMME DE DÉPLOIEMENT (Infrastructure Physique)

```mermaid
graph TD
    node_client["Client Device (Mobile/Desktop)"]
    
    subgraph "Public Cloud"
        node_lb["Load Balancer (Nginx)"]
        
        subgraph "App Server (Docker Container)"
            node_app["Node.js Application"]
        end
        
        subgraph "Database Cluster"
            node_db["MongoDB Atlas (BaaS)"]
        end
    end
    
    node_stripe["Stripe API"]
    node_mail["Email Service (SendGrid/Resend)"]

    node_client -- "HTTPS (443)" --> node_lb
    node_lb -- "HTTP (3000)" --> node_app
    node_app -- "TCH (27017)" --> node_db
    node_app -- "HTTPS" --> node_stripe
    node_app -- "SMTP/API" --> node_mail
```

---

## 5. DIAGRAMME DE SÉQUENCE : RECHERCHE GÉOLOCALISÉE
*Interaction pour "Trouver un service autour de moi".*

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Angular Comp.
    participant Service as Service Service
    participant Backend as Express API
    participant DB as MongoDB

    User->>Frontend: Clique "Autour de moi"
    Frontend->>Frontend: navigator.geolocation.getCurrentPosition()
    Frontend-->>Frontend: Lat: 31.62, Lng: -7.98
    
    Frontend->>Service: getNearbyServices(lat, lng, 10km)
    Service->>Backend: GET /services/within/10/center/31.62,-7.98/unit/km
    
    Backend->>DB: Service.find({ location: { $geoWithin: { $centerSphere... } } })
    Note right of DB: Utilisation Index 2dsphere
    DB-->>Backend: [Service1, Service2, ...]
    
    Backend-->>Service: JSON Response (200 OK)
    Service-->>Frontend: Observable<Service[]>
    Frontend->>Frontend: Update Google Maps Markers
    Frontend-->>User: Affiche les services sur la carte
```
