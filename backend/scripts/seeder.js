const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../src/models/User');
const Service = require('../src/models/Service');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'dkhoul'
        });
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
        password: "Admin@Dkhoul123!",
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
            // Basic error handling for duplicates if run repeatedly without delete
            try {
                const newUser = await User.create(user);
                console.log(`User created: ${newUser.email}`);
                createdUsers.push(newUser);
            } catch (err) {
                console.log(`User ${user.email} already exists or error: ${err.message}`);
                // Try to fetch if exists to keep going? In this script we deleteMany so it should be fine.
            }
        }

        // Re-fetch to be sure we have the IDs
        const youssef = await User.findOne({ email: "youssef@host.com" });
        const khadija = await User.findOne({ email: "khadija@host.com" });

        if (!youssef || !khadija) {
            throw new Error("Hosts not created correctly");
        }

        console.log('Users Imported...'.green.inverse);

        // 3. Create Services (The new 17 validated services)
        const services = [
            // === SPACE (5) ===
            {
                title: "Stationnement Sécurisé - Médina",
                description: "Garage privé surveillé 24/7 au cœur de la médina. Idéal pour garer votre voiture en toute sécurité pendant vos visites. Accès facile, porte automatique.",
                price: 80,
                category: "SPACE",
                host: khadija._id,
                city: "Fès",
                location: { type: "Point", coordinates: [-4.976, 34.062], address: "Médina, Fès" },
                images: ["/assets/images/parking_securise.png"],
                duration: 480, // 8 heures
                timeSlots: ["08:00", "14:00"],
                languages: ["Français", "Darija"]
            },
            {
                title: "Station Recharge Express",
                description: "Rechargez tous vos appareils : téléphones, laptops, batteries caméra. Adaptateurs internationaux fournis. Wifi gratuit pendant l'attente.",
                price: 25,
                category: "SPACE",
                host: youssef._id,
                city: "Marrakech",
                location: { type: "Point", coordinates: [-7.989, 31.629], address: "Gueliz, Marrakech" },
                images: ["/assets/images/recharge_electronique.png"],
                duration: 90, // 1h30
                timeSlots: ["09:00", "12:00", "15:00", "18:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Cuisine Équipée Self-Cooking",
                description: "Accès à une cuisine traditionnelle marocaine entièrement équipée. Tajines, ustensiles, épices de base fournis. Parfait pour préparer vos propres repas.",
                price: 90,
                category: "SPACE",
                host: khadija._id,
                city: "Casablanca",
                location: { type: "Point", coordinates: [-7.618, 33.595], address: "Maarif, Casablanca" },
                images: ["/assets/images/cuisine_equipee.png"],
                duration: 180, // 3 heures
                timeSlots: ["10:00", "16:00"],
                languages: ["Français", "Darija"]
            },
            {
                title: "Laverie Express - Machine à Laver",
                description: "Faites votre lessive en 2h : machine à laver moderne, lessive écologique incluse, séchoir disponible. Plus économique que les pressings.",
                price: 60,
                category: "SPACE",
                host: youssef._id,
                city: "Rabat",
                location: { type: "Point", coordinates: [-6.849, 34.000], address: "Agdal, Rabat" },
                images: ["/assets/images/laverie_machine.png"],
                duration: 150, // 2h30
                timeSlots: ["08:00", "11:00", "14:00", "17:00"],
                languages: ["Français", "Darija"]
            },
            {
                title: "Bureau Privé - Appels Visio",
                description: "Espace calme et professionnel pour vos calls importants. Wifi fibre, fond neutre, éclairage parfait. Silence garanti 100%.",
                price: 120,
                category: "SPACE",
                host: khadija._id,
                city: "Tanger",
                location: { type: "Point", coordinates: [-5.812, 35.789], address: "Centre-ville, Tanger" },
                images: ["/assets/images/espace_reunion.png"],
                duration: 60, // 1 heure
                timeSlots: ["09:00", "11:00", "14:00", "16:00"],
                languages: ["Français", "Anglais"]
            },

            // === SKILL (6) ===
            {
                title: "Cours de Darija Express",
                description: "Apprenez 50 phrases essentielles en darija marocain en 2h. PDF inclus, mise en situation pratique au souk. Parfait pour communiquer avec les locaux !",
                price: 200,
                category: "SKILL",
                host: youssef._id,
                city: "Marrakech",
                location: { type: "Point", coordinates: [-7.989, 31.629], address: "Médina, Marrakech" },
                images: ["/assets/images/cours_darija.png"],
                duration: 120, // 2 heures
                timeSlots: ["10:00", "15:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Pâtisserie Marocaine - Cornes de Gazelle",
                description: "Apprenez à préparer les célèbres cornes de gazelle, chebakia et ghriba avec une pâtissière experte. Ingrédients inclus, repartez avec vos créations !",
                price: 280,
                category: "SKILL",
                host: khadija._id,
                city: "Fès",
                location: { type: "Point", coordinates: [-4.976, 34.062], address: "Médina, Fès" },
                images: ["/assets/images/patisserie_marocaine.png"],
                duration: 180, // 3 heures
                timeSlots: ["09:00", "14:00"],
                languages: ["Français", "Darija"]
            },
            {
                title: "Art du Henné Traditionnel",
                description: "Séance henné personnalisée par une nekacha expérimentée. Motifs berbères ou arabes selon vos goûts. Henné 100% naturel, conseils d'entretien inclus.",
                price: 180,
                category: "SKILL",
                host: khadija._id,
                city: "Essaouira",
                location: { type: "Point", coordinates: [-9.770, 31.508], address: "Médina, Essaouira" },
                images: ["/assets/images/henne_traditionnel.png"],
                duration: 90, // 1h30
                timeSlots: ["10:00", "14:00", "17:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Masterclass Négociation Souk",
                description: "Apprenez l'art de la négociation respectueuse au souk. 1h de théorie + 1h de pratique réelle. Vocabulaire, techniques, et accompagnement sur le terrain.",
                price: 250,
                category: "SKILL",
                host: youssef._id,
                city: "Marrakech",
                location: { type: "Point", coordinates: [-7.989, 31.629], address: "Souk, Marrakech" },
                images: ["/assets/images/negociation_souk.png"],
                duration: 120, // 2 heures
                timeSlots: ["09:00", "15:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Tissage Berbère - Création Tapis",
                description: "Initiez-vous au tissage traditionnel sur métier ancestral. Créez votre propre pièce (sous-verre ou bracelet) sous la guidance d'une artisane berbère.",
                price: 320,
                category: "SKILL",
                host: khadija._id,
                city: "Ouarzazate",
                location: { type: "Point", coordinates: [-6.893, 30.920], address: "Kasbah, Ouarzazate" },
                images: ["/assets/images/tissage_berbere.png"],
                duration: 180, // 3 heures
                timeSlots: ["09:00", "14:00"],
                languages: ["Français", "Darija"]
            },
            {
                title: "Atelier Épices & Ras-el-Hanout",
                description: "Découvrez 25+ épices marocaines et leurs usages. Composez votre propre ras-el-hanout personnalisé à emporter. Dégustation thé incluse.",
                price: 180,
                category: "SKILL",
                host: youssef._id,
                city: "Chefchaouen",
                location: { type: "Point", coordinates: [-5.268, 35.171], address: "Médina, Chefchaouen" },
                images: ["/assets/images/atelier_epices.png"],
                duration: 90, // 1h30
                timeSlots: ["10:00", "15:00"],
                languages: ["Français", "Anglais", "Darija"]
            },

            // === CONNECT (6) ===
            {
                title: "Conseils Voyage par Téléphone",
                description: "Appel de 45min avec un local passionné. Recommandations restos, bons plans, itinéraires personnalisés. Liste WhatsApp envoyée après l'appel.",
                price: 80,
                category: "CONNECT",
                host: youssef._id,
                city: "Casablanca",
                location: { type: "Point", coordinates: [-7.618, 33.595], address: "Casablanca" },
                images: ["/assets/images/conseils_telephone.png"],
                duration: 45, // 45 minutes
                timeSlots: ["09:00", "11:00", "14:00", "17:00", "20:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Transfert Aéroport VIP",
                description: "Accueil personnalisé à l'aéroport avec pancarte. Transport confortable, aide bagages, premiers conseils sur la ville. Ponctualité garantie.",
                price: 250,
                category: "CONNECT",
                host: khadija._id,
                city: "Marrakech",
                location: { type: "Point", coordinates: [-8.038, 31.602], address: "Aéroport Menara, Marrakech" },
                images: ["/assets/images/recuperation_aeroport.png"],
                duration: 90, // 1h30
                timeSlots: ["06:00", "10:00", "14:00", "18:00", "22:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Baby-sitting Bilingue",
                description: "Garde d'enfants par une professionnelle expérimentée. Bilingue français/arabe. Activités ludiques et éducatives. Références disponibles.",
                price: 100,
                category: "CONNECT",
                host: khadija._id,
                city: "Rabat",
                location: { type: "Point", coordinates: [-6.849, 34.000], address: "Rabat" },
                images: ["/assets/images/babysitting_bilingue.png"],
                duration: 180, // 3 heures
                timeSlots: ["18:00", "19:00", "20:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Accompagnement Marché Local",
                description: "Shopping au marché traditionnel avec un expert local. Sélection des meilleurs produits frais, négociation, conseils de préparation inclus.",
                price: 100,
                category: "CONNECT",
                host: youssef._id,
                city: "Fès",
                location: { type: "Point", coordinates: [-4.976, 34.062], address: "Marché, Fès" },
                images: ["/assets/images/courses_marche.png"],
                duration: 120, // 2 heures
                timeSlots: ["07:00", "09:00"],
                languages: ["Français", "Darija"]
            },
            {
                title: "Interprète / Traducteur Ponctuel",
                description: "Assistance traduction pour RDV administratif, médical ou commercial. Parfaitement bilingue français/arabe. Accompagnement physique ou visio.",
                price: 200,
                category: "CONNECT",
                host: khadija._id,
                city: "Casablanca",
                location: { type: "Point", coordinates: [-7.618, 33.595], address: "Casablanca" },
                images: ["/assets/images/traduction_interprete.png"],
                duration: 120, // 2 heures
                timeSlots: ["09:00", "14:00"],
                languages: ["Français", "Anglais", "Darija"]
            },
            {
                title: "Visite Quartier Authentique",
                description: "Découverte des quartiers populaires loin des circuits touristiques. Anecdotes, rencontres habitants, pause thé chez l'habitant. Le vrai Maroc !",
                price: 180,
                category: "CONNECT",
                host: youssef._id,
                city: "Tanger",
                location: { type: "Point", coordinates: [-5.812, 35.789], address: "Vieux Tanger" },
                images: ["/assets/images/visite_quartier.png"],
                duration: 150, // 2h30
                timeSlots: ["09:00", "15:00"],
                languages: ["Français", "Anglais", "Darija", "Espagnol"]
            }
        ];

        console.log(`Adding ${services.length} services...`.yellow);

        for (const service of services) {
            try {
                await Service.create(service);
                console.log(`Created: ${service.title}`);
            } catch (err) {
                console.error(`Failed to create service ${service.title}: ${err.message}`.red);
            }
        }

        console.log('Data Imported Successfully'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Service.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
