const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../utils/appError');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateDescription = async (req, res, next) => {
    try {
        const { title, category } = req.body;

        if (!title || !category) {
            return next(new AppError('Please provide title and category', 400));
        }

        // For safety, ensure API key exists
        if (!process.env.GEMINI_API_KEY) {
            return next(new AppError('Gemini API Key is missing on server', 500));
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Act as a marketing expert for a Moroccan tourism marketplace called DKHOUL. 
        Write a captivating, authentic, and short description (max 3 sentences) for a service titled '${title}' in the category '${category}'. 
        Tone: Warm, welcoming, and emphasizing the magical Moroccan experience.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            status: 'success',
            data: {
                description: text
            }
        });

    } catch (err) {
        console.error('Gemini Error:', err);
        next(new AppError('Failed to generate description', 500));
    }
};

// Chat with AI Guide (CHAKIB)
exports.chatWithGuide = async (req, res, next) => {
    try {
        const { message } = req.body;
        // console.log('AI Chat Request');

        // Security Check
        if (!req.user || !req.user.id) {
            console.error('User not authenticated in AI Chat');
            return next(new AppError('User not authenticated', 401));
        }

        const userId = req.user.id;
        console.log('Using User ID:', userId);

        const AiChat = require('../models/AiChat');

        if (!message) {
            return next(new AppError('Please provide a message', 400));
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('Missing GEMINI_API_KEY');
            return next(new AppError('Server configuration error: Missing API Key', 500));
        }

        // 1. Find or Create Chat History
        let chat = await AiChat.findOne({ user: userId });
        if (!chat) {
            console.log('Creating new chat history for user');
            chat = await AiChat.create({
                user: userId,
                history: []
            });
        }

        // 2. Prepare History for Gemini
        const historyForGemini = chat.history.map(h => ({
            role: h.role,
            parts: h.parts.map(p => ({ text: p.text }))
        }));

        // 3. Configure Model & Persona (PRIMARY: GEMINI)
        const systemInstruction = `You are CHAKIB, a friendly and expert Moroccan tourism guide for the DKHOUL platform. 
        You speak French and English (and Darija if spoken to). 
        You help tourists find activities, understand Moroccan culture, customs, and navigate the app.
        Your tone is warm, welcoming, and slightly poetic, emphasizing the magic of Morocco.
        Keep answers concise (max 3-4 sentences usually) unless a detailed itinerary is asked.
        If asked about technical support, billing, or coding, politely say you are just a guide and they should contact support.
        Always be polite and helpful.`;

        let replyText = '';

        try {
            console.log('Attempting Gemini (Primary)...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const chatSession = model.startChat({
                history: [
                    { role: "user", parts: [{ text: `System Instruction: ${systemInstruction}` }] },
                    { role: "model", parts: [{ text: "Understood. I am CHAKIB, your Moroccan guide. Marhaba!" }] },
                    ...historyForGemini
                ],
                generationConfig: { maxOutputTokens: 500 },
            });

            const result = await chatSession.sendMessage(message);
            const response = await result.response;
            replyText = response.text();
            console.log('Gemini Success');

        } catch (geminiError) {
            console.error('Gemini Failed:', geminiError.message);
            console.log('Attempting OpenRouter (Backup)...');

            if (!process.env.OPENROUTER_API_KEY) {
                throw new Error('Gemini failed and OPENROUTER_API_KEY is missing.');
            }

            const axios = require('axios');
            const openRouterResponse = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: "mistralai/mistral-7b-instruct:free", // or any available model
                    messages: [
                        { role: "system", content: systemInstruction },
                        ...chat.history.map(h => ({ role: h.role, content: h.parts[0].text })),
                        { role: "user", content: message }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'https://dkhoul.ma', // Required by OpenRouter
                        'X-Title': 'DKHOUL'
                    }
                }
            );

            if (openRouterResponse.data && openRouterResponse.data.choices && openRouterResponse.data.choices.length > 0) {
                replyText = openRouterResponse.data.choices[0].message.content;
                console.log('OpenRouter Success');
            } else {
                throw new Error('OpenRouter returned no content');
            }
        }

        // 5. Update DB with new turn
        chat.history.push({
            role: 'user',
            parts: [{ text: message }]
        });
        chat.history.push({
            role: 'model',
            parts: [{ text: replyText }]
        });
        await chat.save();


        // 6. Return Reply
        res.status(200).json({
            status: 'success',
            data: {
                reply: replyText,
                history: chat.history
            }
        });

    } catch (err) {
        console.error('AI Chat Error Detailed:', err);
        next(new AppError('Failed to chat with guide: ' + err.message, 500));
    }
};
