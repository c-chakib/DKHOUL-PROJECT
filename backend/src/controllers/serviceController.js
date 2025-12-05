const Service = require('../models/Service');
const AppError = require('../utils/appError');

exports.createService = async (req, res, next) => {
    try {
        // Add host from authenticated user
        // Assumes authController.protect middleware has run
        if (!req.body.host) req.body.host = req.user.id;

        const newService = await Service.create(req.body);

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

exports.getAllServices = async (req, res, next) => {
    try {
        // BUILD QUERY
        // 1A) Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1B) Advanced Filtering (lte, gte, etc.)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Service.find(JSON.parse(queryStr));

        // EXECUTE QUERY
        const services = await query;

        // SEND RESPONSE
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
