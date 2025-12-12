require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./src/models/Service');
const User = require('./src/models/User');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dkhoul';
const TARGET_HOST_EMAIL = 'superadmin@dkhoul.ma';
const SEED_IMAGES_DIR = path.join(__dirname, 'seed_images');

const CITY_CONFIG = {
    'Marrakech': {
        coords: [-7.9890, 31.6225],
        vibes: ['Jamaa el Fna', 'Medina', 'Palmeraie', 'Guéliz'],
        activities: ['Cours de Cuisine', 'Zellige', 'Hammam Royal', 'Rooftop Jazz', 'Tournée Street Food', 'Atelier Parfum', 'Yoga Riad', 'Calligraphie', 'Poterie Moderne', 'Vélo Medina']
    },
    'Casablanca': {
        coords: [-7.5898, 33.5731],
        vibes: ['Maarif', 'Anfa', 'Centre Ville', 'Ain Diab'],
        activities: ['Visite Grande Mosquée', 'Architecture Art Déco', 'Marché Central', 'Dégustation Fruits de Mer', 'Shopping Luxury', 'Corniche Jogging', 'Business Networking']
    },
    'Fes': {
        coords: [-5.0078, 34.0181],
        vibes: ['Fes el Bali', 'Mellah', 'Ville Nouvelle'],
        activities: ['Tanneries Chouara', 'Artisanat Cuir', 'Reliure Livre Ancien', 'Céramique Bleue', 'Dégustation Street Food', 'Tournée des Remparts']
    },
    'Tangier': {
        coords: [-5.8339, 35.7595],
        vibes: ['Kasbah', 'Malabata', 'Marshane'],
        activities: ['Café Hafa Tea', 'Visite Grotte Hercule', 'Promenade Mer', 'Marché Grand Socco', 'Inspiration Littéraire']
    },
    'Agadir': {
        coords: [-9.6037, 30.4278],
        vibes: ['Marina', 'Talborjt', 'Taghazout'],
        activities: ['Surf Initiation', 'Yoga Plage', 'Souk El Had', 'Grillade Poisson', 'Argan Oil Workshop']
    },
    'Rabat': {
        coords: [-6.8498, 34.0209],
        vibes: ['Agdal', 'Hassan', 'Oudayas'],
        activities: ['Tour Hassan Histoire', 'Kayak Bouregreg', 'Musée Art Moderne', 'Promenade Chellah']
    },
    'Essaouira': {
        coords: [-9.7657, 31.5085],
        vibes: ['Medina', 'Port', 'Diabat'],
        activities: ['Kitesurf', 'Musique Gnaoua', 'Atelier Bois Thuya', 'Peinture Galeries', 'Poisson Frais Port']
    },
    'Chefchaouen': {
        coords: [-5.2684, 35.1688],
        vibes: ['Medina Blue', 'Ras El Ma'],
        activities: ['Photoshoot Bleu', 'Randonnée Rif', 'Tissage Laine', 'Fromage Chèvre Local']
    },
    'Merzouga': {
        coords: [-4.0086, 31.0802],
        vibes: ['Dunes', 'Camp Nomade'],
        activities: ['Bivouac Désert', 'Sandboarding', 'Musique Tambours', 'Astrologie Désert']
    }
};

const IMAGE_MAPPING = {
    'cooking': [
        'moroccan_cooking_class_1765395820899.png',
        'skills_1_cooking_class_1765399642513.png',
        'space_8_kitchen_self_cooking_1765399567872.png'
    ],
    'coworking': [
        'moroccan_coworking_riad_1765395835333.png',
        'space_1_coworking_1765396058060.png',
        'space_6_charging_1765399535451.png'
    ],
    'meeting': ['space_10_meeting_room_1765399599017.png'],
    'souk': ['marrakech_souk_guide_1765395851764.png'],
    'luggage': ['space_2_luggage_storage_1765396076793.png', 'space_9_laundry_1765399585384.png'],
    'shower': ['space_3_shower_express_1765396092027.png'],
    'nap': ['space_4_nap_room_1765396105592.png'],
    'parking': ['space_5_secure_parking_1765396120920.png'],
    'artisan': ['archetype_artisan_crafts_1765398119940.png'],
    'music': ['archetype_music_culture_1765398134311.png'],
    'pickup': ['archetype_transport_pickup_1765398150087.png'],
    'family': ['archetype_family_care_1765398166024.png'],
    'rooftop': ['archetype_rooftop_view_1765398181822.png', 'space_7_rooftop_view_1765399550131.png'],
    'sport': ['archetype_sport_wellness_1765398196129.png'],
    'darija': ['skills_2_darija_class_1765399655879.png']
};

const LANGUAGES = ['Français', 'Arabe (Darija)', 'Anglais', 'Espagnol'];

// --- HELPERS ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const getRandomPrice = () => Math.floor(Math.random() * (600 - 100 + 1)) + 100;

const generateDescription = (title, city, vibe) => {
    const intros = [
        `Découvrez la magie de ${city} avec cette expérience unique.`,
        `Plongez au cœur du vrai Maroc à ${city}.`,
        `Vivez le quartier de ${vibe} comme un local.`,
        `Une activité authentique hors des sentiers battus à ${city}.`
    ];
    return `${getRandomElement(intros)} ${title} est idéal pour ceux qui cherchent l'authenticité. Service professionnel et humain garanti par Dkhoul.`;
};

// --- S3 UPLOAD ---
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadToS3 = async (filename, keyName) => {
    try {
        const filePath = path.join(SEED_IMAGES_DIR, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Warning: Local file ${filename} not found. Skipping.`);
            return null;
        }
        const fileBuffer = fs.readFileSync(filePath);
        const optimizedBuffer = await sharp(fileBuffer).resize(800).webp({ quality: 80 }).toBuffer();
        const s3Key = `seeds/${keyName}.webp`;
        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME, Key: s3Key, Body: optimizedBuffer, ContentType: 'image/webp'
        }));
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    } catch (err) {
        console.error(`❌ Failed to upload ${filename}:`, err.message);
        return null;
    }
};

const determineCategory = (key) => {
    if (['coworking', 'meeting', 'luggage', 'shower', 'nap', 'parking', 'rooftop', 'kitchen', 'charging'].includes(key)) return 'SPACE';
    if (['souk', 'pickup', 'family', 'transport'].includes(key)) return 'CONNECT';
    return 'SKILL'; // Default
};

const getTitleForKey = (key) => {
    const titles = {
        'cooking': 'Mastering Moroccan Tajine',
        'coworking': 'Silent Coworking Hub',
        'meeting': 'Private Meeting Room',
        'souk': 'Gems of the Souk Tour',
        'luggage': 'Secure Luggage Keep',
        'shower': 'Refresh Express Shower',
        'nap': 'Power Nap Station',
        'parking': '24/7 Secure Parking',
        'artisan': 'Zellige & Craft Workshop',
        'music': 'Oud & Music Session',
        'pickup': 'Airport Fast Pickup',
        'family': 'Trusted Family Care',
        'rooftop': 'Sunset Rooftop Access',
        'sport': 'Medina Yoga & Wellness',
        'darija': 'Speak Darija Like a Local'
    };
    return titles[key] || `${key.charAt(0).toUpperCase() + key.slice(1)} Experience`;
};

const seedWithImages = async (hostUserId) => {
    const services = [];
    console.log('🖼️  Creating AI Image Services...');

    for (const [key, files] of Object.entries(IMAGE_MAPPING)) {
        for (const filename of files) {
            const cat = determineCategory(key);
            const title = getTitleForKey(key);

            const s3Url = await uploadToS3(filename, `service_${key}_${Date.now()}_${Math.random()}`);
            if (s3Url) {
                const city = getRandomElement(['Marrakech', 'Casablanca', 'Fes', 'Tangier']); // distribute these top assets
                const vibe = getRandomElement(CITY_CONFIG[city].vibes);
                services.push({
                    title: `${title} - ${city}`,
                    host: hostUserId,
                    description: generateDescription(title, city, vibe),
                    price: getRandomPrice(),
                    category: cat,
                    images: [s3Url],
                    city: city,
                    location: { type: 'Point', coordinates: CITY_CONFIG[city].coords, address: `Quartier ${vibe}, ${city}` },
                    duration: 120, maxParticipants: 6, timeSlots: ["10:00", "14:00"], languages: ['Français', 'Anglais'], included: ['Service Pro'], requirements: ['Sourire']
                });
            }
        }
    }
    return services;
};

const seedWithoutImages = (hostUserId, currentCount) => {
    const services = [];
    console.log(`📝 Filling remaining to reach 60 (Current: ${currentCount})...`);
    const cities = Object.keys(CITY_CONFIG);

    while (currentCount + services.length < 60) {
        const city = getRandomElement(cities);
        const config = CITY_CONFIG[city];
        const activity = getRandomElement(config.activities);
        const vibe = getRandomElement(config.vibes);

        let cat = 'CONNECT';
        const tLower = activity.toLowerCase();
        if (tLower.includes('cours') || tLower.includes('atelier') || tLower.includes('initiation')) cat = 'SKILL';
        if (tLower.includes('bivouac') || tLower.includes('parking') || tLower.includes('douche') || tLower.includes('coworking')) cat = 'SPACE';

        services.push({
            title: `${activity} - ${vibe}`,
            host: hostUserId,
            description: generateDescription(activity, city, vibe),
            price: getRandomPrice(),
            category: cat,
            images: [], // Explicitly empty
            city: city,
            location: {
                type: 'Point',
                coordinates: [config.coords[0] + getRandomFloat(-0.01, 0.01), config.coords[1] + getRandomFloat(-0.01, 0.01)],
                address: `Quartier ${vibe}, ${city}`
            },
            duration: 90, maxParticipants: 3, timeSlots: ["10:00", "16:00"], languages: getRandomSubset(LANGUAGES, 2), included: ['Service Basic'], requirements: ['Ponctualité']
        });
    }
    return services;
};

const seedDB = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI, { dbName: 'dkhoul' });

        let hostUser = await User.findOne({ email: TARGET_HOST_EMAIL });
        if (!hostUser) {
            hostUser = await User.create({
                name: 'Chakib SuperHost', email: TARGET_HOST_EMAIL, password: 'password123', passwordConfirm: 'password123', role: 'superadmin',
                photo: 'https://ui-avatars.com/api/?name=Chakib+Host&background=BC5627&color=fff'
            });
        }
        await Service.deleteMany({});
        console.log('🧹 DB Cleaned.');

        // 1. SERVICES WITH IMAGES
        const imageServices = await seedWithImages(hostUser._id);

        // 2. FILL UP TO 60
        const fillerServices = seedWithoutImages(hostUser._id, imageServices.length);

        const allServices = [...imageServices, ...fillerServices];

        console.log(`💾 Inserting ${allServices.length} services...`);
        await Service.insertMany(allServices);
        console.log('🎉 SUCCESS.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();