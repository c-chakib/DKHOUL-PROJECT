const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const Service = require('./src/models/Service');
const User = require('./src/models/User');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// --- CONFIG ---
const TARGET_HOST_EMAIL = 'superadmin@dkhoul.ma';
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'dkhoul-bucket';
const AWS_REGION = process.env.AWS_REGION || 'eu-west-3';

// --- DATA ---
const CITIES_LIST = [
    'Marrakech', 'Casablanca', 'Fès', 'Tanger', 'Agadir', 'Rabat', 'Essaouira', 'Merzouga', 'Chefchaouen', 'Ouarzazate'
];

const CITIES_DATA = {
    'Marrakech': { lat: 31.6225, lng: -7.9890, districts: ['Medina', 'Gueliz', 'Hivernage'] },
    'Casablanca': { lat: 33.5731, lng: -7.5898, districts: ['Maarif', 'Anfa', 'Ain Diab'] },
    'Fès': { lat: 34.0181, lng: -5.0078, districts: ['Fes el Bali', 'Ville Nouvelle'] },
    'Tanger': { lat: 35.7595, lng: -5.8339, districts: ['Kasbah', 'Malabata'] },
    'Agadir': { lat: 30.4278, lng: -9.6037, districts: ['Marina', 'Taghazout'] },
    'Rabat': { lat: 34.0209, lng: -6.8498, districts: ['Agdal', 'Hassan'] },
    'Essaouira': { lat: 31.5085, lng: -9.7657, districts: ['Medina', 'Port'] },
    'Merzouga': { lat: 31.0802, lng: -4.0086, districts: ['Desert Camp'] },
    'Chefchaouen': { lat: 35.1688, lng: -5.2684, districts: ['Blue City'] },
    'Ouarzazate': { lat: 30.9132, lng: -6.9370, districts: ['Atlas Studio'] }
};

const IMAGE_TO_SERVICE_MAP = {
    // COOKING
    'moroccan_cooking_class_1765540749797.png': { cat: 'SKILL', type: 'Cooking', fr: 'Cours de Cuisine Traditionnelle', en: 'Traditional Cooking Class', ar: 'درس طبخ تقليدي' },
    'kitchen_self_cooking.png': { cat: 'SKILL', type: 'Cooking', fr: 'Atelier Tajine', en: 'Tajine Workshop', ar: 'ورشة طاجين' },
    'patisserie_marocaine.png': { cat: 'SKILL', type: 'Cooking', fr: 'Pâtisserie Marocaine', en: 'Moroccan Pastry Class', ar: 'درس حلويات مغربية' },

    // COWORKING / SPACE
    'coworking_riad_1765540764032.png': { cat: 'SPACE', type: 'Coworking', fr: 'Espace Coworking Riad', en: 'Riad Coworking Space', ar: 'مساحة عمل بالرياض' },
    'meeting_room_business_1765541006295.png': { cat: 'SPACE', type: 'Meeting', fr: 'Salle de Réunion', en: 'Business Meeting Room', ar: 'غرفة اجتماعات' },
    'nap_room_pod_1765540838181.png': { cat: 'SPACE', type: 'Nap', fr: 'Espace Sieste', en: 'Nap Pod', ar: 'مساحة للقيلولة' },
    'luggage_storage_shop_1765540810162.png': { cat: 'SPACE', type: 'Luggage', fr: 'Consigne Bagages', en: 'Luggage Storage', ar: 'خزانة أمتعة' },
    'secure_parking_marrakech_1765540867576.png': { cat: 'SPACE', type: 'Parking', fr: 'Parking Privé', en: 'Private Parking', ar: 'موقف سيارات خاص' },
    'express_shower_hammam_1765540823541.png': { cat: 'SPACE', type: 'Shower', fr: 'Douche Express', en: 'Express Shower', ar: 'حمام سريع' },
    'rooftop_view_sunset_1765540960954.png': { cat: 'SPACE', type: 'Rooftop', fr: 'Accès Rooftop', en: 'Rooftop Access', ar: 'دخول للسطح' },
    'desert_bivouac_luxury_1765541483999.png': { cat: 'SPACE', type: 'Camp', fr: 'Bivouac de Luxe', en: 'Luxury Desert Camp', ar: 'مخيم صحراوي فاخر' },

    // CONNECT / TOURS
    'marrakech_souk_guide_1765540779373.png': { cat: 'CONNECT', type: 'Tour', fr: 'Visite Guidée Souk', en: 'Souk Guided Tour', ar: 'جولة في السوق' },
    'negociation_souk.png': { cat: 'CONNECT', type: 'Tour', fr: 'Art de la Négociation', en: 'Art of Bargaining', ar: 'فن المساومة' },

    // SKILLS / CULTURE
    'artisan_crafts_workshop_1765540883780.png': { cat: 'SKILL', type: 'Craft', fr: 'Atelier Poterie', en: 'Pottery Workshop', ar: 'ورشة خزف' },
    'tissage_berbere.png': { cat: 'SKILL', type: 'Craft', fr: 'Tissage Berbère', en: 'Berber Weaving', ar: 'نسيج بربري' },
    'henne_traditionnel.png': { cat: 'SKILL', type: 'Craft', fr: 'Henné Traditionnel', en: 'Traditional Henna', ar: 'حناء تقليدي' },
    'calligraphy_workshop_islamic_1765541515418.png': { cat: 'SKILL', type: 'Calligraphy', fr: 'Calligraphie Arabe', en: 'Arabic Calligraphy', ar: 'خط عربي' },
    'music_culture_oud_1765540898590.png': { cat: 'SKILL', type: 'Music', fr: 'Cours de Oud', en: 'Oud Lesson', ar: 'درس عود' },
    'darija_language_class_1765540991337.png': { cat: 'SKILL', type: 'Language', fr: 'Cours de Darija', en: 'Darija Class', ar: 'درس دارجة' },
    'moroccan_tea_ceremony.png': { cat: 'SKILL', type: 'Tea', fr: 'Cérémonie du Thé', en: 'Tea Ceremony', ar: 'حفل شاي' },

    // SPORT / WELLNESS
    'sport_wellness_yoga_1765540977603.png': { cat: 'SKILL', type: 'Wellness', fr: 'Yoga au Riad', en: 'Riad Yoga', ar: 'يوغا في الرياض' },
    'surf_school_taghazout_1765541501531.png': { cat: 'SKILL', type: 'Sport', fr: 'Cours de Surf', en: 'Surf Lesson', ar: 'درس ركوب الأمواج' },
    'atlas_hiking_trail_1765542275123.png': { cat: 'SKILL', type: 'Sport', fr: 'Randonnée Atlas', en: 'Atlas Hiking', ar: 'تنزه في الأطلس' },

    // SERVICES
    'transport_pickup_service_1765540913417.png': { cat: 'CONNECT', type: 'Transport', fr: 'Navette Aéroport', en: 'Airport Shuttle', ar: 'نقل للمطار' },
    'recuperation_aeroport.png': { cat: 'CONNECT', type: 'Transport', fr: 'Chauffeur Privé', en: 'Private Driver', ar: 'سائق خاص' },
    'family_care_babysitting_1765540946254.png': { cat: 'CONNECT', type: 'Care', fr: "Garde d'Enfants", en: 'Babysitting', ar: 'جليسة أطفال' },

    // NEW GENERATIONS
    'pottery_safi_workshop_1765542243924.png': { cat: 'SKILL', type: 'Craft', fr: 'Poterie de Safi', en: 'Safi Pottery', ar: 'خزف آسفي' },
    'leather_tannery_fes_1765542258955.png': { cat: 'CONNECT', type: 'Tour', fr: 'Visite Tanneries', en: 'Tanneries Tour', ar: 'زيارة المدابغ' },

    // FALLBACKS / EXTRAS
    'Gemini_Generated_Image_9keka9keka9keka9.png': { cat: 'CONNECT', type: 'Tour', fr: 'Tour Photographique', en: 'Photography Tour', ar: 'جولة تصوير' },
    'Gemini_Generated_Image_b94gjrb94gjrb94g.png': { cat: 'SPACE', type: 'Stay', fr: 'Nuit Riad Historique', en: 'Historic Riad Night', ar: 'ليلة في رياض تاريخي' },
    'Gemini_Generated_Image_bbfwmdbbfwmdbbfw.png': { cat: 'SKILL', type: 'Food', fr: 'Dégustation Street Food', en: 'Street Food Tasting', ar: 'تذوق أكل الشارع' },
    // NEW ADDITIONS
    'traditional_hammam_ritual_1765542707282.png': { cat: 'SKILL', type: 'Wellness', fr: 'Rituel Hammam Traditionnel', en: 'Traditional Hammam Ritual', ar: 'طقوس الحمام التقليدي' },
    'Gemini_Generated_Image_i1bvcoi1bvcoi1bv.png': { cat: 'SKILL', type: 'Craft', fr: 'Atelier Mosaïque Zellige', en: 'Zellige Mosaic Workshop', ar: 'ورشة فسيفساء زليج' },
    'Gemini_Generated_Image_lhlkz1lhlkz1lhlk.png': { cat: 'SKILL', type: 'Sport', fr: 'Quad en Palmeraie', en: 'Quad Biking in Palm Grove', ar: 'دبابات في النخيل' },
    'Gemini_Generated_Image_lhrdlmlhrdlmlhrd.png': { cat: 'SKILL', type: 'Food', fr: "Dégustation Huile d'Olive", en: 'Olive Oil Tasting', ar: 'تذوق زيت زيتون' },
    'Gemini_Generated_Image_npjqhjnpjqhjnpjq.png': { cat: 'CONNECT', type: 'Culture', fr: 'Soirée Contes & Légendes', en: 'Storytelling Night', ar: 'ليلة الحكواتي' },
    'Gemini_Generated_Image_ssvgmpssvgmpssvg.png': { cat: 'CONNECT', type: 'Shopping', fr: 'Chasseur de Tapis', en: 'Carpet Personal Shopper', ar: 'متسوق زراي خاص' },
    'Gemini_Generated_Image_sszal4sszal4ssza.png': { cat: 'CONNECT', type: 'Music', fr: 'Concert Gnaoua Privé', en: 'Private Gnaoua Concert', ar: 'حفل كناوة خاص' },
    // NEW BATCH (50 Total Goal)
    'arabic_percussion_class_1765551092401.png': { cat: 'SKILL', type: 'Music', fr: "Cours de Darbouka", en: "Darbuka Drum Class", ar: "درس دربكة" },
    'architecture_tour_hidden_1765552131354.png': { cat: 'CONNECT', type: 'Tour', fr: "Architecture Cachée", en: "Hidden Architecture Tour", ar: "جولة معمارية مخفية" },
    'argan_oil_pressing_1765551330798.png': { cat: 'SKILL', type: 'Culture', fr: "Extraction Huile d'Argan", en: "Argan Oil Extraction", ar: "استخراج زيت الأرجان" },
    'art_studio_rental_1765551944962.png': { cat: 'SPACE', type: 'Space', fr: "Atelier d'Artiste", en: "Artist Studio Rental", ar: "استوديو فنان للكراء" },
    'astronomy_desert_stargazing_1765553037334.png': { cat: 'CONNECT', type: 'Science', fr: "Astronomie dans le Désert", en: "Desert Stargazing", ar: "تأمل النجوم في الصحراء" },
    'belly_dancing_class_1765551209524.png': { cat: 'SKILL', type: 'Wellness', fr: "Initiation Danse Orientale", en: "Belly Dancing Class", ar: "رقص شرقي" },
    'bread_making_tafarnout_1765551148607.png': { cat: 'SKILL', type: 'Cooking', fr: "Cuisson Pain Tafarnout", en: "Tafarnout Bread Baking", ar: "خبز تفرنوت" },
    'camel_ride_sunset_palm_1765553287516.png': { cat: 'CONNECT', type: 'Adventure', fr: "Balade Chameau Coucher Soleil", en: "Sunset Camel Ride", ar: "ركوب الجمل عند الغروب" },
    'concierge_luxury_service_1765553227496.png': { cat: 'CONNECT', type: 'Service', fr: "Conciergerie VIP", en: "VIP Concierge", ar: "كونسيرج VIP" },
    'fashion_designer_meet_1765552368891.png': { cat: 'CONNECT', type: 'Fashion', fr: "Rencontre Designer Kaftan", en: "Meet Kaftan Designer", ar: "لقاء مصمم قفطان" },
    'food_tour_night_market_1765552190431.png': { cat: 'CONNECT', type: 'Food', fr: "Tour Gastronomique Nocturne", en: "Night Market Food Tour", ar: "جولة سوق ليلي" },
    'garden_party_venue_1765552011441.png': { cat: 'SPACE', type: 'Space', fr: "Jardin Privé pour Soirée", en: "Private Garden Venue", ar: "حديقة خاصة للمناسبات" },
    'graffiti_art_tour_1765552250219.png': { cat: 'CONNECT', type: 'Art', fr: "Tour Street Art", en: "Street Art Tour", ar: "جولة فن الشارع" },
    'hot_air_balloon_atlas_1765553348654.png': { cat: 'CONNECT', type: 'Adventure', fr: "Montgolfière Atlas", en: "Atlas Hot Air Balloon", ar: "منطاد الأطلس" },
    'jewish_heritage_tour_1765552309897.png': { cat: 'CONNECT', type: 'History', fr: "Héritage Juif Mellah", en: "Jewish Heritage Tour", ar: "التراث اليهودي" },
    'meditation_room_serene_1765551957249.png': { cat: 'SPACE', type: 'Wellness', fr: "Salle de Méditation Zen", en: "Zen Meditation Room", ar: "غرفة تأمل" },
    'mosaic_zellige_workshop_1765542720735.png': { cat: 'CONNECT', type: 'Experience', fr: "Atelier Zellige", en: "Zellige Workshop", ar: "ورشة زليج" },
    'olive_oil_tasting_farm_1765542840990.png': { cat: 'CONNECT', type: 'Experience', fr: "Dégustation Huile", en: "Oil Tasting", ar: "تذوق الزيوت" },
    'perfume_making_workshop_1765551078732.png': { cat: 'SKILL', type: 'Craft', fr: "Atelier Création de Parfum", en: "Perfume Making Workshop", ar: "ورشة صناعة العطور" },
    'personal_trainer_gym_1765553107354.png': { cat: 'SKILL', type: 'Sport', fr: "Coach Sportif Privé", en: "Private Personal Trainer", ar: "مدرب شخصي" },
    'photographer_couple_medina_1765553047488.png': { cat: 'CONNECT', type: 'Service', fr: "Shooting Couple Médina", en: "Couple Photoshoot Medina", ar: "جلسة تصوير للأزواج" },
    'podcast_recording_studio_1765551446965.png': { cat: 'SPACE', type: 'Space', fr: "Studio Podcast", en: "Podcast Studio", ar: "استوديو بودكاست" },
    'pottery_painting_activity_1765551268830.png': { cat: 'SKILL', type: 'Craft', fr: "Peinture sur Céramique", en: "Ceramic Painting", ar: "رسم على السيراميك" },
    'private_terrace_dinner_1765551385785.png': { cat: 'SPACE', type: 'Food', fr: "Dîner Romantique Terrasse", en: "Private Terrace Dinner", ar: "عشاء خاص في الشرفة" },
    'quad_biking_palm_grove_1765542778107.png': { cat: 'CONNECT', type: 'Experience', fr: "Quad Palmeraie", en: "Quad Palm Grove", ar: "دبابات النخيل" },
    'reading_nook_library_1765552073124.png': { cat: 'SPACE', type: 'Space', fr: "Coin Lecture Bibliothèque", en: "Library Reading Nook", ar: "ركن القراءة" },
    'storytelling_night_hikayat_1765542898021.png': { cat: 'CONNECT', type: 'Experience', fr: "Soirée Hikayat", en: "Hikayat Night", ar: "ليلة الحكاية" },
    'translator_business_meeting_1765553167660.png': { cat: 'CONNECT', type: 'Business', fr: "Interprète d'Affaires", en: "Business Interpreter", ar: "مترجم أعمال" },
    'vintage_sidecar_tour_1765553358514.png': { cat: 'CONNECT', type: 'Adventure', fr: "Tour en Sidecar Vintage", en: "Vintage Sidecar Tour", ar: "جولة سايدكار كلاسيكية" }
};


// --- S3 CLIENT ---
const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// --- BRANDING UTILS ---
const LOGO_PATH = path.join(__dirname, '../frontend/src/assets/images/logo.png');

const processAndApplyBranding = async (inputBuffer) => {
    try {
        const image = sharp(inputBuffer);
        const metadata = await image.metadata();
        const width = metadata.width || 800;
        const height = metadata.height || 800;

        // 1. CROP: Remove bottom 10% (Watermark area)
        const newHeight = Math.floor(height * 0.9);

        // 2. RESIZE LOGO: 15% of width (Slightly smaller for top-left)
        const logoWidth = Math.round(width * 0.15);
        const logoBuffer = await sharp(LOGO_PATH).resize({ width: logoWidth }).toBuffer();

        // 3. COMPOSITE
        return await image
            .extract({ left: 0, top: 0, width: width, height: newHeight }) // Crop bottom 10%
            .resize(800) // Resize back to standard if needed, or leave cropped size
            .composite([{
                input: logoBuffer,
                gravity: 'northwest', // Top-Left
                top: 20,
                left: 20
            }])
            .webp({ quality: 80 })
            .toBuffer();
    } catch (e) {
        console.error("Branding Error:", e);
        return inputBuffer; // Fallback to raw if branding fails
    }
};

const seedDB = async (targetServiceCount = 150) => {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dkhoul';

    try {
        await mongoose.connect(MONGO_URI, { dbName: 'dkhoul' });
        console.log(`Connected to DB: ${mongoose.connection.host}`);

        // Ensure Logo Exists
        if (!fs.existsSync(LOGO_PATH)) {
            console.error(`CRITICAL: Logo not found at ${LOGO_PATH}`);
        }

        const host = await User.findOne({ email: TARGET_HOST_EMAIL });
        if (!host) throw new Error(`CRITICAL: User ${TARGET_HOST_EMAIL} not found.`);

        // 1. Smart Resume: Check existing count
        let createdCount = await Service.countDocuments();
        const services = [];

        if (createdCount === 0) {
            console.log('🧹 DB empty. Starting fresh generation...');
        } else {
            console.log(`📈 Data found (${createdCount} services). Resuming generation...`);
        }
        const availableTemplates = Object.entries(IMAGE_TO_SERVICE_MAP);

        console.log(`🏭 Starting Generation: ${targetServiceCount} Services (~${targetServiceCount * 3} Images)`);

        while (createdCount < targetServiceCount) {
            // 1. Pick Template
            const [filename, meta] = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

            // 2. Determine City
            let cityKey = 'Marrakech';
            if (meta.type === 'Surf') cityKey = 'Agadir';
            else if (meta.type === 'Tanneries') cityKey = 'Fès';
            else if (meta.type === 'Pottery') cityKey = 'Casablanca';
            else cityKey = CITIES_LIST[Math.floor(Math.random() * CITIES_LIST.length)];

            const cityData = CITIES_DATA[cityKey] || CITIES_DATA['Marrakech'];
            const district = cityData.districts[Math.floor(Math.random() * cityData.districts.length)];

            // 3. Generate Images (1 Main + 2-3 Extras)
            const numExtras = Math.floor(Math.random() * 2) + 2; // 2 or 3 extras
            const imageUrls = [];

            // Prompts
            const mainPrompt = `${meta.en}, moroccan style, ${cityData.districts[0]}, photorealistic, 8k, warm lighting`;
            const prompts = [mainPrompt];

            const modifiers = ['interior details', 'close up texture', 'people usage atmosphere', 'wide angle view'];
            for (let i = 0; i < numExtras; i++) {
                prompts.push(`${meta.en}, ${modifiers[i % modifiers.length]}, moroccan style, photorealistic`);
            }

            console.log(`   [${createdCount + 1}/${targetServiceCount}] Generating ${prompts.length} images for "${meta.en}" in ${cityKey}...`);

            for (const prompt of prompts) {
                try {
                    // Gen
                    const seed = Math.floor(Math.random() * 1000000);
                    const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=800&height=800&seed=${seed}`;

                    // Fetch
                    let response;
                    let retries = 0;
                    while (retries < 3) {
                        try {
                            const controller = new AbortController();
                            const tid = setTimeout(() => controller.abort(), 30000);
                            response = await fetch(url, { signal: controller.signal });
                            clearTimeout(tid);
                            if (response.ok) break;
                            if (response.status === 429) {
                                await new Promise(r => setTimeout(r, 5000)); // Wait 5s
                                retries++;
                            } else {
                                throw new Error(`HTTP ${response.status}`);
                            }
                        } catch (e) {
                            retries++;
                            await new Promise(r => setTimeout(r, 2000));
                        }
                    }
                    if (!response || !response.ok) continue;

                    // Buffer
                    const rawBuffer = Buffer.from(await response.arrayBuffer());

                    // Brand
                    const finalBuffer = await processAndApplyBranding(rawBuffer);

                    // Upload
                    const s3Key = `gen_${Date.now()}_${seed}.webp`;
                    await s3.send(new PutObjectCommand({
                        Bucket: AWS_BUCKET_NAME, Key: s3Key, Body: finalBuffer, ContentType: 'image/webp'
                    }));

                    imageUrls.push(`https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`);
                    process.stdout.write('+');

                } catch (err) {
                    console.error(`     Err: ${err.message}`);
                }
            }

            if (imageUrls.length === 0) {
                console.log("     Skipping service (no images)");
                continue;
            }

            // 4. Create Service
            const svc = new Service({
                title: { fr: meta.fr, en: meta.en, ar: meta.ar },
                description: {
                    fr: `Découvrez ${meta.fr} au cœur de ${cityKey}, quartier ${district}. Une expérience authentique et unique.`,
                    en: `Discover ${meta.en} in the heart of ${cityKey}, ${district} district. An authentic and unique experience.`,
                    ar: `اكتشف ${meta.ar} في قلب ${cityKey}، حي ${district}. تجربة أصيلة وفريدة.`
                },
                host: host._id,
                price: Math.floor(Math.random() * (400 - 30 + 1)) + 30, // 30-400 DH
                category: meta.cat,
                images: imageUrls,
                city: cityKey,
                location: {
                    type: 'Point',
                    coordinates: [
                        cityData.lng + (Math.random() - 0.5) * 0.02,
                        cityData.lat + (Math.random() - 0.5) * 0.02
                    ],
                    address: `${district}, ${cityKey}`
                },
                duration: 90,
                maxParticipants: 10,
                timeSlots: ["10:00", "14:00"],
                languages: ["Français", "Anglais", "Darija"]
            });

            await svc.save();
            createdCount++;
            console.log(` -> Saved!`);

            // Rate limit safety
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log(`\n🎉 COMPLETION: ${createdCount} Services Created.`);
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Error:', err);
        process.exit(1);
    }
};

seedDB();