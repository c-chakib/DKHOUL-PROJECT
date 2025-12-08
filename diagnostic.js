const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const ROOT = __dirname;
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');

let errors = 0;
let warnings = 0;

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ [OK] ${description}`);
        return true;
    } else {
        console.log(`❌ [MANQUANT] ${description}`);
        console.log(`   👉 Chemin attendu : ${filePath}`);
        errors++;
        return false;
    }
}

function checkContent(filePath, searchString, description) {
    if (!fs.existsSync(filePath)) return false;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
        console.log(`✅ [LOGIQUE] ${description}`);
        return true;
    } else {
        console.log(`❌ [LOGIQUE MANQUANTE] ${description}`);
        console.log(`   👉 Le fichier existe, mais ne contient pas : "${searchString}"`);
        errors++;
        return false;
    }
}

console.log('--- 🏥 DÉMARRAGE DU DIAGNOSTIC COMPLET DKHOUL ---');

// --- 1. BACKEND CHECKS ---
console.log('\n--- 🔙 BACKEND AUDIT ---');

// Models
checkFile(path.join(BACKEND, 'src/models/Service.js'), 'Modèle Service');
checkContent(path.join(BACKEND, 'src/models/Service.js'), 'location: {', 'Service a le champ géo-localisation');
checkContent(path.join(BACKEND, 'src/models/Service.js'), "enum: ['SKILL', 'SPACE', 'CONNECT']", 'Service a les catégories strictes');
checkFile(path.join(BACKEND, 'src/models/Report.js'), 'Modèle Report (Signalement)');

// Controllers
checkContent(path.join(BACKEND, 'src/controllers/serviceController.js'), 'exports.updateService', 'Service Controller a la fonction Update');
checkContent(path.join(BACKEND, 'src/controllers/adminController.js'), 'exports.createReport', 'Admin Controller gère les signalements');

// Config
checkFile(path.join(BACKEND, 'config/swagger.js'), 'Configuration Swagger');
checkContent(path.join(BACKEND, 'app.js'), '/api-docs', 'Route Swagger montée dans App.js');

// --- 2. FRONTEND CHECKS ---
console.log('\n--- 🖥️ FRONTEND AUDIT ---');

// Environment
checkContent(path.join(FRONTEND, 'src/environments/environment.ts'), 'apiUrl:', 'Environment TS configuré');
if(checkContent(path.join(FRONTEND, 'src/environments/environment.ts'), 'localhost:5000', 'Environment pointe vers localhost (Dev)')) {
    // C'est bon pour le dev
}

// Service Detail (Le Hub)
const serviceDetailPath = path.join(FRONTEND, 'src/app/features/service-detail/service-detail.component.ts');
if (checkFile(serviceDetailPath, 'Composant Service Detail')) {
    checkContent(serviceDetailPath, 'queryParams: {', 'Navigation Paiement utilise queryParams (Fix P1)');
    checkContent(serviceDetailPath, 'chatService.initiateChat', 'Bouton Chat câblé (Fix P2)');
    checkContent(serviceDetailPath, 'selectImage', 'Galerie Images interactive');
}

// Home Page
const homePath = path.join(FRONTEND, 'src/app/features/home/home.component.ts');
if (checkFile(homePath, 'Composant Home')) {
    checkContent(homePath, 'serviceService.getAllServices()', 'Home utilise la VRAIE Database (Pas de Mock)');
}

// Edit Service
checkFile(path.join(FRONTEND, 'src/app/features/dashboard/host/edit-service/edit-service.component.ts'), 'Composant Edit Service (Fix P2)');

// PWA & Assets
checkFile(path.join(FRONTEND, 'src/manifest.webmanifest'), 'Manifest PWA');
checkFile(path.join(FRONTEND, 'ngsw-config.json'), 'Config Service Worker PWA');
checkFile(path.join(FRONTEND, 'src/assets/icons/icon-72x72.png'), 'Icônes PWA générées');

// --- 3. RAPPORT FINAL ---
console.log('\n--- 📊 RÉSULTAT DU DIAGNOSTIC ---');
if (errors === 0) {
    console.log('🟢 ETAT DU PROJET : EXCELLENT (PRODUCTION READY)');
    console.log('   Tout semble être à sa place pour la démo.');
} else {
    console.log(`🔴 ETAT DU PROJET : CRITIQUE (${errors} ERREURS)`);
    console.log('   Veuillez corriger les points marqués ❌ ci-dessus.');
}
console.log('-------------------------------------------------');