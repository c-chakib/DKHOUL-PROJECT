const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../src/models/User');
const Service = require('../src/models/Service');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); // Using MONGODB_URI as per your .env
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

const users = [
    {
        name: "Admin User",
        email: "admin@dkhoul.com",
        password: "Admin@Dkhoul123!", // 12+ chars, upper, lower, number, symbol
        passwordConfirm: "Admin@Dkhoul123!",
        role: "admin",
        isVerified: true
    },
    {
        name: "Youssef Guide",
        email: "youssef@host.com",
        password: "Youssef@Host123!",
        passwordConfirm: "Youssef@Host123!",
        role: "host",
        isVerified: true,
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    {
        name: "Khadija Space",
        email: "khadija@host.com",
        password: "Khadija@Host123!",
        passwordConfirm: "Khadija@Host123!",
        role: "host",
        isVerified: true,
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    {
        name: "Sophie Tourist",
        email: "sophie@tourist.com",
        password: "Sophie@Tour123!",
        passwordConfirm: "Sophie@Tour123!",
        role: "tourist",
        isVerified: true
    }
];

const importData = async () => {
    try {
        await connectDB();

        // 1. Clean DB
        await Service.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed...'.red.inverse);

        // 2. Create Users
        console.log('Creating users...'.yellow);
        const createdUsers = [];
        for (const user of users) {
            console.log(`Creating user: ${user.email}`);
            try {
                const newUser = await User.create(user);
                console.log(`User created: ${newUser.email}`);
                createdUsers.push(newUser);
            } catch (err) {
                console.error(`Failed to create user ${user.email}: ${err.message}`.red);
            }
        }
        console.log(`Total users created: ${createdUsers.length}`);

        const youssef = createdUsers.find(u => u.email === "youssef@host.com");
        const khadija = createdUsers.find(u => u.email === "khadija@host.com");

        if (!youssef || !khadija) {
            throw new Error("Hosts not created correctly");
        }

        console.log('Users Imported...'.green.inverse);

        // 3. Create Services
        const services = [
            // --- SPACE ---
            {
                title: "Stockage Bagages Sécurisé",
                description: "Laissez vos valises en toute sécurité pendant que vous visitez le Maarif. Casier surveillé 24/7.",
                price: 50,
                category: "SPACE",
                host: khadija._id,
                location: { type: "Point", coordinates: [-7.632, 33.590], address: "Maarif, Casablanca" },
                images: ["https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80"] // Storage/Luggage
            },
            {
                title: "Coworking Calme avec Fibre",
                description: "Espace de travail partagé avec connexion haut débit, café gratuit et salle de réunion.",
                price: 100,
                category: "SPACE",
                host: khadija._id,
                location: { type: "Point", coordinates: [-6.849, 34.000], address: "Agdal, Rabat" },
                images: ["https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=800&q=80"] // Coworking
            },
            {
                title: "Douche Express & Vestiaire",
                description: "Idéal pour se rafraîchir après une excursion. Serviettes et savon fournis.",
                price: 70,
                category: "SPACE",
                host: youssef._id,
                location: { type: "Point", coordinates: [-8.008, 31.634], address: "Gueliz, Marrakech" },
                images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"] // Bathroom/Shower
            },
            {
                title: "Rooftop Vue Mer pour Photos",
                description: "Accès exclusif à mon toit terrasse avec vue imprenable sur le détroit pour vos shootings.",
                price: 150,
                category: "SPACE",
                host: khadija._id,
                location: { type: "Point", coordinates: [-5.812, 35.789], address: "Kasbah, Tanger" },
                images: ["https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"] // Rooftop/View
            },
            {
                title: "Sieste au calme dans Riad",
                description: "Reposez-vous 2h dans une chambre fraîche et silencieuse au cœur de la médina.",
                price: 200,
                category: "SPACE",
                host: youssef._id,
                location: { type: "Point", coordinates: [-4.976, 34.062], address: "Médina, Fès" },
                images: ["https://images.unsplash.com/photo-1532323544230-7191fd510c59?auto=format&fit=crop&w=800&q=80"] // Riad/Rest
            },

            // --- SKILL ---
            {
                title: "Masterclass Tajine au Citron",
                description: "Apprenez les secrets du vrai tajine marocain avec ma grand-mère. Ingrédients inclus.",
                price: 350,
                category: "SKILL",
                host: khadija._id,
                location: { type: "Point", coordinates: [-7.989, 31.629], address: "Médina, Marrakech" },
                images: ["https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80"] // Tajine/Cooking
            },
            {
                title: "Initiation Menuiserie Bois Thuya",
                description: "Découverte de l'artisanat local d'Essaouira. Repartez avec votre création.",
                price: 250,
                category: "SKILL",
                host: youssef._id,
                location: { type: "Point", coordinates: [-9.770, 31.508], address: "Essaouira" },
                images: ["https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80"] // Woodworking
            },
            {
                title: "Cours de Surf Débutant",
                description: "Cours privé de 2h sur les vagues de Taghazout. Planche et combi fournies.",
                price: 200,
                category: "SKILL",
                host: youssef._id,
                location: { type: "Point", coordinates: [-9.711, 30.542], address: "Taghazout" },
                images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80"] // Surf
            },
            {
                title: "Atelier Poterie & Zellige",
                description: "Façonnez l'argile et découvrez l'art du Zellige Fassi traditionnel.",
                price: 300,
                category: "SKILL",
                host: khadija._id,
                location: { type: "Point", coordinates: [-4.980, 34.058], address: "Fès" },
                images: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"] // Pottery
            },
            {
                title: "Cours de Percussion Gnaoua",
                description: "Vibrez aux rythmes du désert. Initiation aux qraqeb et au tbel.",
                price: 150,
                category: "SKILL",
                host: youssef._id,
                location: { type: "Point", coordinates: [-4.013, 31.080], address: "Merzouga" },
                images: ["https://images.unsplash.com/photo-1519892300165-31a5463f0f8f?auto=format&fit=crop&w=800&q=80"] // Music/Drums
            },

            // --- CONNECT ---
            {
                title: "Guide Shopping Anti-Arnaque",
                description: "Je vous accompagne dans les souks pour négocier les meilleurs prix sans stress.",
                price: 100,
                category: "CONNECT",
                host: youssef._id,
                location: { type: "Point", coordinates: [-7.990, 31.625], address: "Souk, Marrakech" },
                images: ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"] // Souk/Shopping
            },
            {
                title: "Photographe Personnel Blue City",
                description: "Photoshoot professionnel dans les ruelles bleues les plus instagrammables.",
                price: 400,
                category: "CONNECT",
                host: khadija._id,
                location: { type: "Point", coordinates: [-5.268, 35.171], address: "Chefchaouen" },
                images: ["https://images.unsplash.com/photo-1539655529457-36e3c09191d4?auto=format&fit=crop&w=800&q=80"] // Chefchaouen
            },
            {
                title: "Tour Food Street (Msemmen/Harira)",
                description: "Dégustation des meilleurs spots de street food casablancais (non touristiques).",
                price: 120,
                category: "CONNECT",
                host: youssef._id,
                location: { type: "Point", coordinates: [-7.618, 33.595], address: "Casablanca" },
                images: ["https://images.unsplash.com/photo-1588647008107-167e4369da8a?auto=format&fit=crop&w=800&q=80"] // Moroccan Food
            },
            {
                title: "Visite Historique Guidée",
                description: "Découvrez les secrets du Chellah et de la Tour Hassan avec un passionné d'histoire.",
                price: 80,
                category: "CONNECT",
                host: khadija._id,
                location: { type: "Point", coordinates: [-6.835, 34.007], address: "Chellah, Rabat" },
                images: ["https://images.unsplash.com/photo-1533604104257-ddef7b8bd918?auto=format&fit=crop&w=800&q=80"] // Rabat/History
            },
            {
                title: "Compagnon Rando Toubkal (Demi-journée)",
                description: "Randonnée niveau facile/moyen autour d'Imlil avec thé chez l'habitant.",
                price: 300,
                category: "CONNECT",
                host: youssef._id,
                location: { type: "Point", coordinates: [-7.917, 31.141], address: "Imlil, Atlas" },
                images: ["https://images.unsplash.com/photo-1502448404283-d51e73711909?auto=format&fit=crop&w=800&q=80"] // Hiking/Atlas
            }
        ];

        await Service.create(services);
        console.log('Services Imported (15)...'.green.inverse);

        console.log('Data Imported Successfully'.green.inverse);
        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // Add delete function if needed, but import includes clean
    // destroyData();
} else {
    importData();
}
