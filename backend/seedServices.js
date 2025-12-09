const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Adaptation des chemins (supposé être à la racine du backend/)
const Service = require('./src/models/Service');
const User = require('./src/models/User');

dotenv.config();

const TOTAL_SERVICES = 50;

// --- 1. CONFIGURATION GÉOGRAPHIQUE ---
const CITIES = {
    'Marrakech': { lat: 31.6295, lng: -7.9811 },
    'Casablanca': { lat: 33.5731, lng: -7.5898 },
    'Agadir': { lat: 30.4278, lng: -9.5981 },
    'Tanger': { lat: 35.7595, lng: -5.8340 },
    'Fès': { lat: 34.0181, lng: -5.0078 },
    'Rabat': { lat: 34.0209, lng: -6.8416 },
    'Essaouira': { lat: 31.5085, lng: -9.7595 },
    'Merzouga': { lat: 31.0802, lng: -4.0133 }
};

// 🔴 FIX: On retire "Allemand" car ton Modèle ne l'accepte pas
const LANGUAGES = ['Darija', 'Français', 'Anglais', 'Espagnol'];

// --- 2. HORAIRES LOGIQUES ---
const TIME_SLOTS_BY_CATEGORY = {
    'SKILL': ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    'SPACE': ["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
    'CONNECT': ["09:30", "10:30", "14:30", "16:30", "18:30"]
};

// --- 3. BANQUE D'IMAGES FIABLES (Unsplash IDs) ---
const MASTER_IMAGES = {
    cooking: [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
        "https://images.unsplash.com/photo-1511690656952-34342d2c7135?w=800",
        "https://images.unsplash.com/photo-1543615307-b3554805c56d?w=800",
        "https://images.unsplash.com/photo-1580442451755-d69c79e95088?w=800",
        "https://images.unsplash.com/photo-1560787313-5dff3307e257?w=800",
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800",
        "https://images.unsplash.com/photo-1590595978583-3967cf17d2ea?w=800",
        "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800",
        "https://images.unsplash.com/photo-1621852004158-b3c169263306?w=800",
        "https://images.unsplash.com/photo-1601315379734-425a469078de?w=800",
        "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800"
    ],
    artisanat: [
        "https://images.unsplash.com/photo-1584448141569-69f362562725?w=800",
        "https://images.unsplash.com/photo-1455620611406-966ca6889d80?w=800",
        "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800",
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
        "https://images.unsplash.com/photo-1459603677915-a62079ffd030?w=800",
        "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?w=800",
        "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800",
        "https://images.unsplash.com/photo-1516934024742-b461fba47600?w=800",
        "https://images.unsplash.com/photo-1605218427360-36390f85583b?w=800",
        "https://images.unsplash.com/photo-1598555877840-7f2824b61b3c?w=800",
        "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=800",
        "https://images.unsplash.com/photo-1565193566173-7a64b27876e9?w=800"
    ],
    surf: [
        "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=800",
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800",
        "https://images.unsplash.com/photo-1520116468816-95b69f847357?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
        "https://images.unsplash.com/photo-1455731885844-30230649cb4a?w=800",
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
        "https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?w=800"
    ],
    riad: [
        "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800",
        "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800",
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
        "https://images.unsplash.com/photo-1597500331034-d6545b796d11?w=800",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
        "https://images.unsplash.com/photo-1533630762958-690226c6d26c?w=800",
        "https://images.unsplash.com/photo-1535892550186-b4b1a8d9a265?w=800"
    ],
    desert: [
        "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800",
        "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        "https://images.unsplash.com/photo-1531388301556-91f8c1488c0c?w=800",
        "https://images.unsplash.com/photo-1549488347-384379e496fa?w=800",
        "https://images.unsplash.com/photo-1517260739337-6799d2eb9ce0?w=800",
        "https://images.unsplash.com/photo-1547234935-80c7142ee969?w=800",
        "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800",
        "https://images.unsplash.com/photo-1546274780-0a5682252a16?w=800"
    ],
    guide: [
        "https://images.unsplash.com/photo-1548263594-a71c358536b1?w=800",
        "https://images.unsplash.com/photo-1535069275988-51829e2f3d1b?w=800",
        "https://images.unsplash.com/photo-1520390138845-fd2d229dd552?w=800",
        "https://images.unsplash.com/photo-1552674605-5d2178b85608?w=800",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
        "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800",
        "https://images.unsplash.com/photo-1550586678-f7b28d94c92e?w=800",
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
        "https://images.unsplash.com/photo-1512418490979-92798cec1380?w=800",
        "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800",
        "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800",
        "https://images.unsplash.com/photo-1471253794676-0f039a6aae9d?w=800"
    ],
    coworking: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800",
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
        "https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=800",
        "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800"
    ]
};

const THEMES = [
    { id: 'cooking', category: 'SKILL', titles: ["Cours de Cuisine Traditionnelle", "Masterclass Tajine", "Atelier Pâtisserie"], desc: "Apprenez à cuisiner comme un local avec des produits frais.", priceRange: [200, 450], poolId: 'cooking' },
    { id: 'artisanat', category: 'SKILL', titles: ["Atelier Poterie", "Initiation Zellige", "Tissage de Tapis"], desc: "Découvrez l'artisanat marocain et créez votre souvenir.", priceRange: [150, 350], poolId: 'artisanat' },
    { id: 'surf', category: 'SKILL', titles: ["Cours de Surf Débutant", "Session Surf Sunset"], desc: "Domptez les vagues de l'Atlantique avec un moniteur.", priceRange: [150, 300], poolId: 'surf' },
    { id: 'riad', category: 'SPACE', titles: ["Rooftop Vue Panoramique", "Patio Riad Traditionnel", "Terrasse Privée"], desc: "Un espace magique pour vos événements ou shootings.", priceRange: [300, 800], poolId: 'riad' },
    { id: 'coworking', category: 'SPACE', titles: ["Espace Coworking", "Bureau Privé Vue Mer", "Salle de Réunion Créative"], desc: "L'endroit idéal pour télétravailler au calme.", priceRange: [50, 150], poolId: 'coworking' },
    { id: 'desert', category: 'SPACE', titles: ["Nuit sous les étoiles", "Bivouac de Luxe"], desc: "Vivez l'expérience du désert dans un confort absolu.", priceRange: [400, 900], poolId: 'desert' },
    { id: 'guide', category: 'CONNECT', titles: ["Visite Guidée des Souks", "Shopping avec un Local", "Photographe Personnel"], desc: "Découvrez la ville à travers les yeux d'un habitant.", priceRange: [100, 250], poolId: 'guide' }
];

// --- UTILITAIRES ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomSubarray = (arr, size) => {
    const shuffled = arr.slice(0);
    let i = arr.length, temp, index;
    while (i--) {
        index = Math.floor(Math.random() * (i + 1));
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- LOGIQUE SCRIPT ---
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const IMAGE_POOLS = JSON.parse(JSON.stringify(MASTER_IMAGES));

        let host = await User.findOne({ email: 'host@dkhoul.ma' });
        if (!host) {
            host = await User.findOne({ role: 'host' });
            if (!host) {
                console.error('❌ ERREUR: Aucun Host trouvé (email: host@dkhoul.ma ou role: host).');
                process.exit(1);
            }
        }

        await Service.deleteMany({});
        console.log('🗑️  Services existants supprimés.');

        const servicesToInsert = [];
        const cityNames = Object.keys(CITIES);
        let servicesCreated = 0;
        let loops = 0;

        console.log(`🏭 Génération de ${TOTAL_SERVICES} services...`);

        while (servicesCreated < TOTAL_SERVICES && loops < 500) {
            loops++;
            const shuffledThemes = shuffleArray([...THEMES]);

            for (const theme of shuffledThemes) {
                if (servicesCreated >= TOTAL_SERVICES) break;

                // Récupération de la piscine d'images
                let currentPool = IMAGE_POOLS[theme.poolId];

                // 🔴 FIX: On demande MAX 4 images pour respecter ton Modèle
                const maxImagesPossible = Math.min(4, currentPool.length); 
                // Si plus de 3 images dispo, on en prend entre 3 et 4. Sinon on prend tout.
                const nbImagesToTake = maxImagesPossible >= 3 ? getRandomInt(3, 4) : maxImagesPossible;

                if (currentPool.length < 3) { // Si presque vide, recharge
                    currentPool = [...MASTER_IMAGES[theme.poolId]];
                    IMAGE_POOLS[theme.poolId] = currentPool;
                }

                const serviceImages = currentPool.splice(0, nbImagesToTake);

                const city = getRandom(cityNames);
                const templateTitle = getRandom(theme.titles);
                const categorySlots = TIME_SLOTS_BY_CATEGORY[theme.category];
                const randomSlots = getRandomSubarray(categorySlots, getRandomInt(2, 4)).sort();

                const baseCoords = CITIES[city];
                const lat = baseCoords.lat + (Math.random() - 0.5) * 0.03;
                const lng = baseCoords.lng + (Math.random() - 0.5) * 0.03;

                const service = {
                    title: `${templateTitle} à ${city}`,
                    description: `${theme.desc} Vivez une expérience authentique avec nos experts locaux. Profitez d'un moment unique et inoubliable.`,
                    host: host._id,
                    price: getRandomInt(theme.priceRange[0], theme.priceRange[1]),
                    category: theme.category,
                    city: city,
                    images: serviceImages, 
                    location: {
                        type: 'Point',
                        coordinates: [lng, lat],
                        address: `Quartier ${city}, Maroc`
                    },
                    duration: getRandomInt(60, 240),
                    maxParticipants: getRandomInt(2, 10),
                    languages: getRandomSubarray(LANGUAGES, getRandomInt(1, 3)),
                    timeSlots: randomSlots,
                    included: ['Matériel', 'Thé à la menthe', 'Accompagnement'],
                    requirements: ['Votre sourire', 'Vêtements confortables'],
                    rating: parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
                    availability: [
                        { date: new Date(), slots: 5 },
                        { date: new Date(Date.now() + 86400000), slots: 5 }
                    ]
                };

                servicesToInsert.push(service);
                servicesCreated++;
            }
        }

        await Service.insertMany(servicesToInsert);
        console.log(`✨ SUCCÈS : ${servicesToInsert.length} services injectés !`);
        console.log(`📸 Images respectées : Max 4.`);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();