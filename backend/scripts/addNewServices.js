const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../src/models/User');
const Service = require('../src/models/Service');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

// Moroccan cities with coordinates
const cities = [
    { name: "Marrakech", coords: [-7.989, 31.629] },
    { name: "Fès", coords: [-4.976, 34.062] },
    { name: "Casablanca", coords: [-7.618, 33.595] },
    { name: "Rabat", coords: [-6.849, 34.000] },
    { name: "Tanger", coords: [-5.812, 35.789] },
    { name: "Chefchaouen", coords: [-5.268, 35.171] },
    { name: "Essaouira", coords: [-9.770, 31.508] },
    { name: "Agadir", coords: [-9.598, 30.421] },
    { name: "Ouarzazate", coords: [-6.893, 30.920] },
    { name: "Merzouga", coords: [-4.013, 31.080] }
];

const getRandomCity = () => cities[Math.floor(Math.random() * cities.length)];

const addNewServices = async () => {
    try {
        await connectDB();

        // Find existing hosts
        const youssef = await User.findOne({ email: "youssef@host.com" });
        const khadija = await User.findOne({ email: "khadija@host.com" });

        if (!youssef || !khadija) {
            console.log('Hosts not found. Please run the main seeder first.'.red);
            process.exit(1);
        }

        console.log('Found hosts: Youssef and Khadija'.green);

        // New services with AI-generated images
        const newServices = [
            // === SPACE (5 new) ===
            {
                title: "Stationnement Sécurisé - Médina",
                description: "Garage privé surveillé 24/7 au cœur de la médina. Idéal pour garer votre voiture en toute sécurité pendant vos visites. Accès facile, porte automatique.",
                price: 80,
                category: "SPACE",
                host: khadija._id,
                city: "Fès",
                location: { type: "Point", coordinates: [-4.976, 34.062], address: "Médina, Fès" },
                images: ["/assets/images/parking_securise.png"],
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
            },

            // === SKILL (6 new) ===
            {
                title: "Cours de Darija Express",
                description: "Apprenez 50 phrases essentielles en darija marocain en 2h. PDF inclus, mise en situation pratique au souk. Parfait pour communiquer avec les locaux !",
                price: 200,
                category: "SKILL",
                host: youssef._id,
                city: "Marrakech",
                location: { type: "Point", coordinates: [-7.989, 31.629], address: "Médina, Marrakech" },
                images: ["/assets/images/cours_darija.png"],
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
            },

            // === CONNECT (6 new) ===
            {
                title: "Conseils Voyage par Téléphone",
                description: "Appel de 45min avec un local passionné. Recommandations restos, bons plans, itinéraires personnalisés. Liste WhatsApp envoyée après l'appel.",
                price: 80,
                category: "CONNECT",
                host: youssef._id,
                city: "Casablanca",
                location: { type: "Point", coordinates: [-7.618, 33.595], address: "Casablanca" },
                images: ["/assets/images/conseils_telephone.png"],
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
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
                isAiGenerated: true
            }
        ];

        console.log(`Adding ${newServices.length} new services...`.yellow);

        for (const service of newServices) {
            try {
                await Service.create(service);
                console.log(`✅ Created: ${service.title}`.green);
            } catch (err) {
                console.error(`❌ Failed: ${service.title} - ${err.message}`.red);
            }
        }

        console.log('\n========================================'.cyan);
        console.log(`${newServices.length} new services added successfully!`.green.bold);
        console.log('========================================'.cyan);

        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

addNewServices();
