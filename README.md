# 🇲🇦 DKHOUL - Moroccan Marketplace

**DKHOUL** (دخول) is a premium Moroccan marketplace connecting tourists with authentic local experiences. Built with the MEAN stack (MongoDB, Express, Angular, Node.js).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-19-red.svg)
![Node](https://img.shields.io/badge/Node.js-20-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)

---

## ✨ Features

### 🧳 For Tourists

- Browse authentic Moroccan experiences (SPACE, SKILL, CONNECT)
- Interactive map with Leaflet.js
- Secure payments via Stripe
- Real-time chat with hosts (Socket.io)
- Beautiful, responsive Moroccan-themed UI

### 🏠 For Hosts

- Create and manage service listings
- AI-powered description generation (Google Gemini)
- Image upload with Base64 storage
- Dashboard with bookings and revenue tracking

### 👑 For Admins

- Super Admin Dashboard with analytics
- Category distribution charts (Chart.js)
- User and service management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 19, TailwindCSS, Leaflet.js, ng2-charts |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT, Google OAuth 2.0 |
| **Payments** | Stripe API |
| **AI** | Google Gemini API |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Installation

### Option 1: Docker (Recommended) 🐳

**Prerequisites:**

- [Docker](https://www.docker.com/products/docker-desktop/) installed
- [Docker Compose](https://docs.docker.com/compose/) v2+

**Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/dkhoul-marketplace.git
cd dkhoul-marketplace

# 2. Create environment file (optional, uses defaults)
cp .env.example .env

# 3. Start all services with one command
docker-compose up --build

# 4. Access the app
# Frontend: http://localhost:4200
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

**Useful Docker Commands:**

```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild a specific service
docker-compose up --build backend

# Remove volumes (⚠️ deletes database)
docker-compose down -v
```

---

### Option 2: Manual Installation

**Prerequisites:**

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

**Backend Setup:**

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
npm run dev
```

**Frontend Setup:**

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start Angular dev server
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` folder:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/dkhoul

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=90d

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_xxx

# Google Services
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GEMINI_API_KEY=xxx
```

---

## 📁 Project Structure

```
DKHOUL PROJECT/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middlewares/    # Auth, uploads
│   │   └── utils/          # Helpers
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Services, guards
│   │   │   ├── features/   # Pages/components
│   │   │   └── shared/     # Reusable components
│   │   └── environments/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .dockerignore
└── README.md
```

---

## 🎨 Screenshots

| Home Page | Marketplace | Service Detail |
|-----------|-------------|----------------|
| Hero with typewriter animation | List/Map toggle | Rich data display |

---

## 📜 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/google-login` | Google OAuth |
| GET | `/api/v1/services` | Get all services |
| GET | `/api/v1/services/:id` | Get single service |
| POST | `/api/v1/services` | Create service (Host) |
| GET | `/api/v1/services/my-services` | Get host's services |
| DELETE | `/api/v1/services/:id` | Delete service |
| POST | `/api/v1/bookings` | Create booking |
| GET | `/api/v1/bookings/my-bookings` | Get user's bookings |
| POST | `/api/v1/ai/generate-description` | AI description |
| GET | `/api/v1/admin/stats` | Admin dashboard stats |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**DKHOUL Team**  
Built with ❤️ in Morocco 🇲🇦

---

## 🙏 Acknowledgments

- [Angular](https://angular.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [Google Gemini](https://ai.google.dev/)
- [Leaflet](https://leafletjs.com/)
