require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./src/models/Service');
const User = require('./src/models/User');

// --- CONSTANTS ---
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dkhoul';
const TARGET_HOST_EMAIL = 'superadmin@dkhoul.ma';
const CITIES = ['Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga'];
const LANGUAGES_ENUM = ['Darija', 'Français', 'Anglais', 'Espagnol'];

// --- DATA POOLS ---
const SKILL_TITLES = [
    'Cooking Class: Authentic Tagine', 'Pottery Workshop with Master Artisan', 'Surf Lesson for Beginners', 'Zellige Making Experience', 'Arabic Calligraphy Basics',
    'Moroccan Pastry Masterclass', 'Traditional Weaving Workshop', 'Leather Crafting Session', 'Tea Ceremony & Mint Planting', 'Oud Music Lesson'
];

const SPACE_TITLES = [
    'Traditional Riad Rooftop', 'Modern Coworking Space in Medina', 'Nomadic Desert Tent', 'Seaside Villa Terrace', 'Hidden Garden Sanctuary',
    'Artistic Studio Loft', 'Historic Courtyard for Events', 'Panoramic Ocean View Deck', 'Berber Tent Experience', 'Luxury Palmeraie Villa'
];

const CONNECT_TITLES = [
    'Guided Medina History Tour', 'Street Food Tasting Walk', 'Sunrise Photography Walk', 'Hidden Gems of the Souk', 'Local Storytelling Night',
    'Architectural Heritage Tour', 'Sunset Camel Ride', 'Atlas Mountains Hiking Trip', 'Spiritual Sufi Music Evening', 'Traditional Hammam Ritual'
];

const DESCRIPTIONS = [
    "Experience the true essence of Morocco with this exclusive activity. Perfect for travelers seeking authenticity.",
    "Join us for an unforgettable journey into the heart of local culture. Connect, learn, and create memories.",
    "A unique opportunity to immerse yourself in Moroccan heritage. Suitable for all skill levels.",
    "Discover hidden treasures and local secrets with our expert guides. A must-do experience."
];

const IMAGES_POOL = [
    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80", // Morocco generic
    "https://images.unsplash.com/photo-1534444558509-2ae1d6436664?auto=format&fit=crop&w=800&q=80", // Patterns
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", // Tajine
    "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80", // Desert
    "https://images.unsplash.com/photo-1558239058-29367c339c09?auto=format&fit=crop&w=800&q=80", // Chefchaouen
    "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=800&q=80", // Riad
    "https://images.unsplash.com/photo-1535970793575-d97157ccfcfd?auto=format&fit=crop&w=800&q=80", // Spices
    "https://images.unsplash.com/photo-1549141068-a832a82cb79a?auto=format&fit=crop&w=800&q=80", // Street
    "https://images.unsplash.com/photo-1512591290618-97a801712136?auto=format&fit=crop&w=800&q=80", // Architecture
    "https://images.unsplash.com/photo-1530735038726-a73fd6e6a349?auto=format&fit=crop&w=800&q=80", // Decor
    "https://images.unsplash.com/photo-1590059390239-4d6d84f85e50?auto=format&fit=crop&w=800&q=80", // Tea
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80"  // Carpet
];

// --- CITY COORDINATES (Approximate for center) ---
const CITY_COORDS = {
    'Casablanca': [-7.5898, 33.5731],
    'Marrakech': [-7.9890, 31.6225],
    'Agadir': [-9.6035, 30.4278],
    'Tanger': [-5.8327, 35.7595],
    'Fès': [-5.0078, 34.0181],
    'Rabat': [-6.8498, 34.0209],
    'Essaouira': [-9.7595, 31.5085],
    'Merzouga': [-4.0046, 31.0667]
};

// --- HELPERS ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

const getRandomPrice = () => Math.floor(Math.random() * (400 - 40 + 1)) + 40;

const getFuzzedCoordinates = (cityValues) => {
    const [lng, lat] = cityValues;
    const fuzzLat = lat + getRandomFloat(-0.03, 0.03);
    const fuzzLng = lng + getRandomFloat(-0.03, 0.03);
    return [fuzzLng, fuzzLat];
};

const generateService = (category, hostId) => {
    const city = getRandomElement(CITIES);
    const coords = getFuzzedCoordinates(CITY_COORDS[city]);

    let titlePool;
    if (category === 'SKILL') titlePool = SKILL_TITLES;
    else if (category === 'SPACE') titlePool = SPACE_TITLES;
    else titlePool = CONNECT_TITLES;

    const title = getRandomElement(titlePool) + ` - ${city} Vibes`;

    return {
        title: title,
        host: hostId,
        description: getRandomElement(DESCRIPTIONS),
        price: getRandomPrice(),
        category: category,
        images: getRandomSubset(IMAGES_POOL, 4), // 4 Unique urls
        city: city,
        location: {
            type: 'Point',
            coordinates: coords,
            address: `Random St, ${city}, Morocco`
        },
        duration: Math.floor(Math.random() * 180) + 60, // 60 to 240 mins
        maxParticipants: Math.floor(Math.random() * 10) + 2,
        timeSlots: ["09:00", "14:00", "17:00"],
        languages: getRandomSubset(LANGUAGES_ENUM, 2),
        included: ['Tea', 'Equipment', 'Guide'],
        requirements: ['Comfortable shoes', 'Good vibes']
    };
};

// --- MAIN SCRIPT ---
const seedDB = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        // 1. Find or Create Host
        let hostUser = await User.findOne({ email: TARGET_HOST_EMAIL });
        if (!hostUser) {
            console.log(`⚠️ User '${TARGET_HOST_EMAIL}' not found. Creating it automatically...`);
            hostUser = await User.create({
                name: 'Super Chakib',
                email: TARGET_HOST_EMAIL,
                password: 'password123',
                passwordConfirm: 'password123',
                role: 'superadmin',
                photo: 'https://ui-avatars.com/api/?name=Super+Chakib&background=BC5627&color=fff'
            });
            console.log(`✅ Created Host: ${hostUser.name} (${hostUser._id})`);
        } else {
            console.log(`👤 Found Host: ${hostUser.name} (${hostUser._id})`);
        }

        // 2. Clean DB
        console.log('🧹 Cleaning Service collection...');
        await Service.deleteMany({});
        console.log('✨ DB Cleaned.');

        // 3. Generate Data
        const services = [];

        // 30 SKILL
        console.log('🛠 Generating 30 SKILL services...');
        for (let i = 0; i < 30; i++) {
            services.push(generateService('SKILL', hostUser._id));
        }

        // 30 SPACE
        console.log('🏰 Generating 30 SPACE services...');
        for (let i = 0; i < 30; i++) {
            services.push(generateService('SPACE', hostUser._id));
        }

        // 30 CONNECT
        console.log('🤝 Generating 30 CONNECT services...');
        for (let i = 0; i < 30; i++) {
            services.push(generateService('CONNECT', hostUser._id));
        }

        // 4. Insert
        console.log(`💾 Inserting ${services.length} services...`);
        await Service.insertMany(services);

        console.log('🎉 SUCCESS: 90 Golden Services seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    }
};

seedDB();
