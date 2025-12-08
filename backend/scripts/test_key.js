const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load env
const result = dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Dotenv parsed:', result.parsed ? 'Yes' : 'No');
if (result.error) console.log('Dotenv Error:', result.error.message);

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.log('❌ GEMINI_API_KEY is undefined or empty.');
} else {
    console.log(`✅ Loaded Key starting with: ${key.substring(0, 4)}...`);
    // Test Validity
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    model.generateContent("Test")
        .then(() => console.log("✅ API Key is Valid and Working!"))
        .catch(err => {
            console.log("❌ API Verification Failed:", err.message.split('\n')[0]);
            if (err.message.includes("404")) console.log("   (Model not found, but key likely okay?)");
            if (err.message.includes("400")) console.log("   (Key Invalid or Bad Request)");
        });
}
