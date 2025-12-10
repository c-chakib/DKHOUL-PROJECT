const Service = require('../models/Service');
const AppError = require('../utils/appError');

exports.createService = async (req, res, next) => {
    try {
        // Add host from authenticated user
        if (!req.body.host) req.body.host = req.user.id;

        // Security: Filter allowed fields only
        const filteredBody = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            images: req.body.images,
            city: req.body.city,
            duration: req.body.duration,
            maxParticipants: req.body.maxParticipants,
            languages: req.body.languages,
            included: req.body.included,
            requirements: req.body.requirements,
            location: req.body.location,
            metadata: req.body.metadata,
            host: req.user.id
        };

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
        console.log('Fetching all services with pagination...');

        // 1. Check Cache
        const cacheKey = `services:all:${JSON.stringify(req.query)}`;
        const cachedData = await getCache(cacheKey);

        if (cachedData) {
            console.log('Serving from cache');
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

        // 1C) Search (Title/Description)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
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

        // 3) EXECUTE QUERY (Count & Data)
        const total = await Service.countDocuments(filter);

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

        const services = await query;
        console.log(`Found ${services.length} services (Page ${page})`);

        // 4. Set Cache
        await setCache(cacheKey, services, 3600);

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

