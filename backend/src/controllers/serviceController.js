const Service = require('../models/Service');
const AppError = require('../utils/appError');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to check service ownership
const checkServiceOwnership = (service, user, next) => {
    if (service.host.toString() !== user.id && user.role !== 'admin' && user.role !== 'superadmin') {
        throw new AppError('You do not have permission to perform this action', 403);
    }
};

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
        // Whitelist allowed fields
        const allowedFields = ['title', 'description', 'price', 'category', 'city', 'images', 'maxParticipants', 'timeSlots', 'duration', 'difficulty', 'languages', 'included', 'requirements', 'address', 'location'];
        const additionalFields = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) additionalFields[field] = req.body[field];
        });

        // Add Multi-language Support if provided separately or use what's in body if structure matches
        // But here we rely on what was passed or constructed above
        const filteredBody = {
            ...additionalFields,
            // Ensure title/desc are properly set if handled by some other logic, but here we trust the body structure for them
            // If the user sent { title: {fr: '..'} }, it's captured in additionalFields['title']
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
        // FORCE REFRESH: Bump version to v6
        const cacheKey = `services:v6:all:${JSON.stringify(req.query)}`;

        // Add Cache-Control headers to prevent 304 browser caching issues
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');

        const cachedResult = await getCache(cacheKey);
        console.timeEnd('CacheGet');

        if (cachedResult) {
            console.timeEnd('TotalRequest');
            return res.status(200).json({
                status: 'success',
                total: cachedResult.total || 0,
                results: cachedResult.services.length,
                source: 'cache',
                data: {
                    services: cachedResult.services
                }
            });
        }

        // 1A) Filtering
        const queryObj = { ...req.query };

        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const filter = JSON.parse(queryStr);

        // Helper: Escape string for RegExp
        const escapeStringRegexp = (string) => {
            if (typeof string !== 'string') {
                throw new TypeError('Expected a string');
            }
            return string
                .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                .replace(/-/g, '\\x2d');
        };

        // 1C) Search (Title/Description)
        if (req.query.search) {
            const searchStr = String(req.query.search).slice(0, 100);
            const sanitizedSearch = escapeStringRegexp(searchStr);
            const searchRegex = new RegExp(sanitizedSearch, 'i');
            filter.$or = [
                { 'title.fr': { $regex: searchRegex } },
                { 'title.en': { $regex: searchRegex } },
                { 'description.fr': { $regex: searchRegex } },
                { 'description.en': { $regex: searchRegex } },
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
        await setCache(cacheKey, { services, total }, 3600);
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
        checkServiceOwnership(service, req.user, next);

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
        checkServiceOwnership(service, req.user, next);

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
