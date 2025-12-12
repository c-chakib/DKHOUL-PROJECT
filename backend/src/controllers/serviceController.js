const Service = require('../models/Service');
const AppError = require('../utils/appError');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.createService = async (req, res, next) => {
    try {
        // Add host from authenticated user
        if (!req.body.host) req.body.host = req.user.id;

        const { title, description, lang } = req.body;
        const sourceLang = lang || 'fr'; // Default source language

        // 1. Prepare Multilingual Object (Initial)
        let multiTitle = {};
        let multiDesc = {};

        // 2. Set the Source Language Content
        multiTitle[sourceLang] = title;
        multiDesc[sourceLang] = description;

        // 3. Call Gemini for Auto-Translation
        if (process.env.GEMINI_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const prompt = `
                Translate the following JSON object from '${sourceLang}' to English (en), French (fr), and Arabic (ar).
                If a key matches the source language, keep it as is.
                Return ONLY a valid JSON object with this structure:
                {
                    "title": { "fr": "...", "en": "...", "ar": "..." },
                    "description": { "fr": "...", "en": "...", "ar": "..." }
                }

                Input:
                {
                    "title": "${title}",
                    "description": "${description}"
                }
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean and Parse JSON
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const translatedData = JSON.parse(jsonStr);

                // Merge Translations
                multiTitle = { ...multiTitle, ...translatedData.title };
                multiDesc = { ...multiDesc, ...translatedData.description };

            } catch (aiError) {
                console.error("Gemini Translation Failed:", aiError);
                // Fallback: Use source text for all languages to avoid validation errors
                ['fr', 'en', 'ar'].forEach(l => {
                    if (!multiTitle[l]) multiTitle[l] = title;
                    if (!multiDesc[l]) multiDesc[l] = description;
                });
            }
        } else {
            // Fallback if no API Key
            ['fr', 'en', 'ar'].forEach(l => {
                if (!multiTitle[l]) multiTitle[l] = title;
                if (!multiDesc[l]) multiDesc[l] = description;
            });
        }

        // Security: Filter allowed fields only
        const filteredBody = {
            ...req.body,
            title: multiTitle,
            description: multiDesc,
            host: req.user.id
        };

        // Remove 'lang' from filteredBody if it exists (not in schema)
        delete filteredBody.lang;

        const newService = await Service.create(filteredBody);

        res.status(201).json({
            status: 'success',
            data: {
                service: newService,
            },
        });
    } catch (err) {
        next(err);
    }
};

const { getCache, setCache } = require('../services/cache.service');

exports.getAllServices = async (req, res, next) => {
    try {
        console.time('TotalRequest');

        // 1. Check Cache
        console.time('CacheGet');
        const cacheKey = `services:all:${JSON.stringify(req.query)}`;
        const cachedData = await getCache(cacheKey);
        console.timeEnd('CacheGet');

        if (cachedData) {
            console.timeEnd('TotalRequest');
            return res.status(200).json({
                status: 'success',
                results: cachedData.length,
                source: 'cache',
                data: {
                    services: cachedData
                }
            });
        }

        // 1A) Filtering
        const queryObj = { ...req.query };

        // Handle flat keys from Angular (e.g. price[gte]) if parser didn't nest them
        if (queryObj['price[gte]']) {
            if (!queryObj.price) queryObj.price = {};
            queryObj.price.gte = queryObj['price[gte]'];
            delete queryObj['price[gte]'];
        }
        if (queryObj['price[lte]']) {
            if (!queryObj.price) queryObj.price = {};
            queryObj.price.lte = queryObj['price[lte]'];
            delete queryObj['price[lte]'];
        }

        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search']; // Exclude 'search'
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const filter = JSON.parse(queryStr);

        const escapeStringRegexp = require('../utils/escape-string-regexp');

        // 1C) Search (Title/Description)
        if (req.query.search) {
            const sanitizedSearch = escapeStringRegexp(req.query.search);
            const searchRegex = new RegExp(sanitizedSearch, 'i');
            filter.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { city: { $regex: searchRegex } }
            ];
        }

        // 2) PAGINATION
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 9;
        const skip = (page - 1) * limit;

        // 3) EXECUTE QUERY (Count & Data in Parallel)
        console.time('DBQuery');
        let query = Service.find(filter)
            .skip(skip)
            .limit(limit);

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const [total, services] = await Promise.all([
            Service.countDocuments(filter),
            query
        ]);
        console.timeEnd('DBQuery');

        // 4. Set Cache
        console.time('CacheSet');
        await setCache(cacheKey, services, 3600);
        console.timeEnd('CacheSet');

        console.timeEnd('TotalRequest');

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            total,
            results: services.length,
            page,
            source: 'db',
            data: {
                services,
            },
        });
    } catch (err) {
        console.error('Data Fetch Error:', err);
        next(new AppError('Failed to fetch services: ' + err.message, 500));
    }
};

exports.getOneService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id).populate({
            path: 'host',
            select: 'name photo',
        });

        if (!service) {
            return next(new AppError('No service found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                service,
            },
        });
    } catch (err) {
        next(err);
    }
};

// /services-within/:distance/center/:latlng/unit/:unit
// /services-within/233/center/34.111,-118.111/unit/mi
exports.getServicesWithin = async (req, res, next) => {
    try {
        const { distance, latlng, unit } = req.params;
        const [lat, lng] = latlng.split(',');

        const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

        if (!lat || !lng) {
            return next(
                new AppError(
                    'Please provide latitude and longitude in the format lat,lng.',
                    400
                )
            );
        }

        const services = await Service.find({
            location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
        });

        res.status(200).json({
            status: 'success',
            results: services.length,
            data: {
                services,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Get services created by the current logged-in host
exports.getMyServices = async (req, res, next) => {
    try {
        const services = await Service.find({ host: req.user.id });

        res.status(200).json({
            status: 'success',
            results: services.length,
            data: {
                services,
            },
        });
    } catch (err) {
        next(err);
    }
};        // Delete a service (only owner or admin can delete)
exports.deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return next(new AppError('No service found with that ID', 404));
        }

        // Check ownership (unless admin)
        if (service.host.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return next(new AppError('You do not have permission to delete this service', 403));
        }

        await Service.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
};

// Update a service (only owner or admin can update)
exports.updateService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return next(new AppError('No service found with that ID', 404));
        }

        // Check ownership (unless admin)
        if (service.host.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return next(new AppError('You do not have permission to update this service', 403));
        }

        // Filter allowed fields
        const allowedFields = ['title', 'description', 'price', 'category', 'images', 'city',
            'duration', 'maxParticipants', 'languages', 'included', 'requirements', 'location'];
        const filteredBody = {};
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredBody[key] = req.body[key];
            }
        });

        const updatedService = await Service.findByIdAndUpdate(req.params.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                service: updatedService,
            },
        });
    } catch (err) {
        next(err);
    }
};

