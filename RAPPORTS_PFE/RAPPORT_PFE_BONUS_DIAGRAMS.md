# ANNEXE : DIAGRAMMES BONUS (GESTION DE PROJET & SÉCURITÉ)

Pour donner une dimension vraiment professionnelle "Ingénieur" à votre mémoire, voici 3 diagrammes supplémentaires qui font souvent la différence devant le jury.

---

## 5. PLANNING PRÉVISIONNEL (Diagramme de GANTT)

*(À insérer dans l'Introduction ou la Gestion de Projet)*

Ce diagramme prouve que vous avez travaillé de manière organisée (Méthode Agile/Scrum).

```mermaid
gantt
    title Planning de Réalisation - Projet DKHOUL
    dateFormat  YYYY-MM-DD
    section Cadrage
    Analyse des Besoins       :a1, 2024-09-01, 10d
    Choix Technologiques      :a2, after a1, 5d
    Conception UML            :a3, after a2, 10d
    
    section Développement Backend
    Setup & Authentification  :b1, 2024-09-25, 10d
    API Services & Uploads    :b2, after b1, 15d
    Système de Réservation    :b3, after b2, 20d
    
    section Développement Frontend
    Maquettes & UI Kit        :c1, 2024-10-15, 10d
    Intégration Angular Core  :c2, after c1, 15d
    Marketplace & Carte       :c3, after c2, 15d
    Dashboard & Chat          :c4, after c3, 15d

    section Finalisation
    Tests & Sécurité          :d1, 2024-12-01, 10d
    Déploiement DevOps        :d2, after d1, 5d
    Rédaction Mémoire         :d3, after d2, 15d
```

---

## 6. ARCHITECTURE DE SÉCURITÉ (Defense in Depth)

*(À insérer dans le Chapitre 6 : Qualité & Sécurité)*

Ce diagramme inédit montre toutes les couches de protection que la requête traverse avant de toucher la base de données. C'est très valorisant pour la note technique.

```mermaid
graph TD
    Request["Requête Client HTTP"]
    
    subgraph "Niveau Réseau / Serveur"
        SSL["HTTPS (SSL/TLS)"]
        Cors["CORS Policy (Origin Check)"]
        Limit["Rate Limiting (Anti-DDoS)"]
    end
    
    subgraph "Middlewares Express (App Level)"
        Helmet["Helmet (Headers Sécurisés)"]
        Sanitize["MongoSanitize (Anti-NoSQL Injection)"]
        XSS["XSS Protection (Content Filter)"]
    end
    
    subgraph "Contrôle d'Accès (Business Logic)"
        Auth["JWT Verify (Authentification)"]
        RBAC["Role Guard (Autorisation)"]
    end
    
    subgraph "Persistance"
        Bcrypt["Bcrypt Hashing (Mots de passe)"]
        DB[("MongoDB")]
    end

    Request --> SSL
    SSL --> Cors
    Cors --> Limit
    Limit --> Helmet
    Helmet --> Sanitize
    Sanitize --> XSS
    XSS --> Auth
    Auth --> RBAC
    RBAC --> Bcrypt
    Bcrypt --> DB
```

---

## 7. MODÈLE LOGIQUE DE DONNÉES (ERD)

*(À insérer dans le Chapitre 4 : Conception)*

Une vue logique simplifiée des relations (Cardinalités) pour compléter le diagramme de classes.

```mermaid
erDiagram
    USER ||--o{ BOOKING : "fait"
    USER ||--o{ SERVICE : "héberge"
    USER ||--o{ REVIEW : "écrit"
    USER {
        string email
        string role
    }
    
    SERVICE ||--o{ BOOKING : "reçoit"
    SERVICE ||--o{ REVIEW : "possède"
    SERVICE {
        string category
        geopoint location
    }
    
    BOOKING {
        date date
        string status
        string payment_status
    }
    
    REVIEW {
        int rating
        string comment
    }
```
