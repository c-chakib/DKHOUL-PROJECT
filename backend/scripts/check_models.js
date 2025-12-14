const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Removed unused variable
        // Actually typically it's specific. Let's try to just output what we can.
        // The node SDK might not have listModels exposed easily on the main class in older versions?
        // Let's try the direct method if available.

        // Actually, let's just try running a generation with 'gemini-1.0-pro' as a fallback blindly if I can't list.
        // But better to try to list if possible.
        // Documentation says: 
        // const genAI = new GoogleGenerativeAI(API_KEY);
        // ... no direct listModels on genAI instance in some versions?

        console.log("Checking models...");
        // Just try a simple generation with a few candidates
        const candidates = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

        for (const modelName of candidates) {
            try {
                console.log(`Trying ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} works!`);
                break;
            } catch (e) {
                console.log(`❌ FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
