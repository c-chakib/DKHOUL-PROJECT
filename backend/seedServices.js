require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./src/models/Service');
const User = require('./src/models/User');

// --- CONSTANTS ---
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dkhoul';
const TARGET_HOST_EMAIL = 'superadmin@dkhoul.ma';

// --- 1. BIBLIOTHÈQUE D'IMAGES VÉRIFIÉE (Images Unsplash Génériques) ---
const MOROCCAN_IMAGES = [
    // --- VILLES & ARCHITECTURE ---
    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512521743077-a42eeaaa963c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560132333-e7178de34749?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590605927533-874288863e46?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559586616-361e18714958?auto=format&fit=crop&w=800&q=80",

    // --- DÉSERT & NATURE ---
    "https://images.unsplash.com/photo-1531545532551-b8d234a9b544?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",

    // --- ARTISANAT ---
    "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
];

// Fallback sûr
const SAFE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1539655529457-36e3c09191d4?auto=format&fit=crop&w=800&q=80";

// Helpers Image
const getRandomImage = () => {
    if (MOROCCAN_IMAGES.length === 0) return SAFE_FALLBACK_IMAGE;
    return MOROCCAN_IMAGES[Math.floor(Math.random() * MOROCCAN_IMAGES.length)];
};

const generateDescription = (title, city, vibe) => {
    const intros = [
        `Découvrez la magie de ${city} à travers cette expérience unique.`,
        `Plongez au cœur du vrai Maroc avec cet atelier authentique à ${city}.`,
        `Une opportunité rare de vivre le quartier de ${vibe} comme un local.`,
        `Loin des sentiers battus, rejoignez-nous pour un moment de partage à ${city}.`
    ];
    const details = [
        `Nous utiliserons des matériaux locaux et respecterons les méthodes ancestrales.`,
        `Parfait pour les débutants comme pour les passionnés, dans une ambiance conviviale (Dkhoul).`,
        `Votre hôte expert vous guidera étape par étape pour une immersion totale.`,
        `Un moment de détente et d'apprentissage qui soutient l'économie locale.`
    ];
    return `${getRandomElement(intros)} ${title} est une activité pensée pour ceux qui cherchent l'authenticité. ${getRandomElement(details)} Repartez avec des souvenirs inoubliables.`;
};

// --- 2. CONFIGURATION GÉOGRAPHIQUE ---
const CITY_CONFIG = {
    'Marrakech': {
        coords: [-7.9890, 31.6225],
        vibes: ['Jamaa el Fna', 'Medina', 'Palmeraie', 'Guéliz'],
        activities: ['Cours de Cuisine', 'Zellige', 'Hammam Royal', 'Rooftop Jazz', 'Tournée Street Food', 'Atelier Parfum', 'Yoga Riad', 'Calligraphie', 'Poterie Moderne', 'Vélo Medina']
    },
    'Fès': {
        coords: [-5.0078, 34.0181],
        vibes: ['Mellah', 'Médina Antique', 'Tanneries', 'Bouanania'],
        activities: ['Travail du Cuir', 'Reliure Traditionnelle', 'Dinanderie', 'Histoire Spirituelle', 'Cuisine Fassi', 'Mosaïque Géométrique', 'Oud & Musique Andalouse', 'Découverte Artisans', 'Poterie Bleue', 'Photographie Architecture']
    },
    'Essaouira': {
        coords: [-9.7595, 31.5085],
        vibes: ['Mogador', 'Port de Pêche', 'Plage', 'Skala'],
        activities: ['Surf Débutant', 'Cuisine Fruits de Mer', 'Marqueterie', 'Musique Gnaoua', 'Peinture Art Naïf', 'Balade à Cheval', 'Yoga Plage', 'Pêche Traditionnelle', 'Fabrication Huile Argan', 'Kitesurf']
    },
    'Merzouga': {
        coords: [-4.0046, 31.0667],
        vibes: ['Dunes Erg Chebbi', 'Sahara', 'Oasis', 'Camp Nomade'],
        activities: ['Bivouac de Luxe', 'Observation Étoiles', 'Pain de Sable', 'Musique Tambours', 'Meditation Désert', 'Balade Dromadaire', 'Thé au Sahara', 'Sandboarding', 'Découverte Fossiles', 'Cuisine Berbère']
    },
    'Chefchaouen': {
        coords: [-5.2684, 35.1688],
        vibes: ['Perle Bleue', 'Montagne', 'Ras El Ma', 'Akchour'],
        activities: ['Teinture Laine', 'Tissage Traditionnel', 'Photographie Rue Bleue', 'Randonnée Rif', 'Cuisine Montagnarde', 'Fromage de Chèvre', 'Balade Cascades', 'Atelier Savon', 'Peinture sur Bois', 'Yoga Montagne']
    },
    'Agadir': {
        coords: [-9.6035, 30.4278],
        vibes: ['Taghazout Bay', 'Souk El Had', 'Marina', 'Valée du Paradis'],
        activities: ['Surf Pro', 'Paddle Board', 'Cuisine Souss', 'Fabrication Miel', 'Randonnée Paradise Valley', 'Jet Ski', 'Pêche en Mer', 'Yoga Sunset', 'Co-working Vue Mer', 'Grillade Sardines']
    },
    'Casablanca': {
        coords: [-7.5898, 33.5731],
        vibes: ['Art Déco', 'Corniche', 'Habous', 'Old Medina'],
        activities: ['Architecture Tour', 'Cuisine Moderne', 'Business Networking', 'Photographie Urbaine', 'Mode & Design', 'Atelier DJing', 'Boxe Traditionnelle', 'Dégustation Poissons', 'Visite Mosquée Privée', 'Street Art Tour']
    },
    'Tanger': {
        coords: [-5.8327, 35.7595],
        vibes: ['Kasbah', 'Café Hafa', 'Cap Spartel', 'Grottes Hercule'],
        activities: ['Écriture & Littérature', 'Peinture Marine', 'Cuisine Méditerranéenne', 'Balade Mythes & Légendes', 'Musique Jazz & Blues', 'Thé à la Menthe Hafa', 'Visite Légations', 'Design Textile', 'Photographie Détroit', 'Vannerie']
    },
    'Ouarzazate': {
        coords: [-6.9370, 30.9189],
        vibes: ['Hollywood Afrique', 'Ait Ben Haddou', 'Oasis Fint', 'Kasbahs'],
        activities: ['Cinéma & Décors', 'Architecture Terre', 'Poterie Berbère', 'Tapis Glaoui', 'Randonnée Oasis', 'Quad Désert', 'Cuisine Tajine', 'Histoire Kasbah', 'Astronomie Kasbah', 'Gravures Rupestres']
    }
};

const LANGUAGES = ['Darija', 'Français', 'Anglais', 'Espagnol'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const getRandomPrice = () => Math.floor(Math.random() * (600 - 100 + 1)) + 100;

// --- MAIN GENERATOR ---
const seedDB = async () => {
    try {
        // SAFETY CHECK
        if (process.env.NODE_ENV === 'production') {
            console.error('🛑 CRITICAL SAFETY: Cannot run seed script in PRODUCTION without manual override.');
            console.error('To bypass, set NODE_ENV to something else or modify this script.');
            process.exit(1);
        }

        console.log('🌱 Connexion à MongoDB...');
        await mongoose.connect(MONGO_URI, { dbName: 'dkhoul' });
        console.log('✅ Connecté.');

        let hostUser = await User.findOne({ email: TARGET_HOST_EMAIL });
        if (!hostUser) {
            hostUser = await User.create({
                name: 'Chakib SuperHost',
                email: TARGET_HOST_EMAIL,
                password: 'password123',
                passwordConfirm: 'password123',
                role: 'superadmin',
                photo: 'https://ui-avatars.com/api/?name=Chakib+Host&background=BC5627&color=fff'
            });
            console.log('✅ Host créé.');
        }

        await Service.deleteMany({});
        console.log('🧹 DB Nettoyée.');

        const services = [];
        const cities = Object.keys(CITY_CONFIG);

        // Boucle sur les villes
        for (const city of cities) {
            const config = CITY_CONFIG[city];
            const cityActivities = config.activities;

            // Boucle sur les activités
            for (const activityTitle of cityActivities) {

                let category = 'SKILL';
                const titleLower = activityTitle.toLowerCase();
                if (titleLower.includes('tour') || titleLower.includes('balade') || titleLower.includes('visite') || titleLower.includes('randonnée') || titleLower.includes('sandboarding') || titleLower.includes('quad')) {
                    category = 'CONNECT';
                } else if (titleLower.includes('bivouac') || titleLower.includes('co-working') || titleLower.includes('hammam') || titleLower.includes('hébergement') || titleLower.includes('riad')) {
                    category = 'SPACE';
                }

                const vibe = getRandomElement(config.vibes);
                const coords = [
                    config.coords[0] + getRandomFloat(-0.02, 0.02),
                    config.coords[1] + getRandomFloat(-0.02, 0.02)
                ];

                // Génération Images
                const mainImage = getRandomImage();
                // Pour la galerie, on prend 2 autres images
                const gallery1 = getRandomImage();
                const gallery2 = getRandomImage();

                const service = {
                    title: `${activityTitle} - ${vibe}`,
                    host: hostUser._id,
                    description: generateDescription(activityTitle, city, vibe),
                    price: getRandomPrice(),
                    category: category,
                    images: [mainImage, gallery1, gallery2],
                    city: city,
                    location: {
                        type: 'Point',
                        coordinates: coords,
                        address: `Quartier ${vibe}, ${city}, Maroc`
                    },
                    duration: Math.floor(Math.random() * 180) + 60,
                    maxParticipants: Math.floor(Math.random() * 8) + 2,
                    timeSlots: ["10:00", "15:00", "18:00"],
                    languages: getRandomSubset(LANGUAGES, 2),
                    included: ['Thé à la menthe', 'Matériel', 'Guide'],
                    requirements: ['Curiosité', 'Respect local']
                };

                services.push(service);
            }
        }

        console.log(`💾 Insertion de ${services.length} services...`);
        await Service.insertMany(services);

        console.log('🎉 SUCCESS: Les liens sont réparés (format ixlib) et fonctionnels !');
        process.exit(0);

    } catch (err) {
        console.error('❌ ERREUR:', err);
        process.exit(1);
    }
};

seedDB();