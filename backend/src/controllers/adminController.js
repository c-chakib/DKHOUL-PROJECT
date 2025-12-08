const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const AppError = require('../utils/appError');

exports.getDashboardStats = async (req, res, next) => {
    try {
        // 1. Revenue: Sum of price of all 'paid' bookings
        const revenueStats = await Booking.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
        ]);
        const revenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

        // 2. Counts
        const usersCount = await User.countDocuments();
        const servicesCount = await Service.countDocuments();
        const bookingsCount = await Booking.countDocuments();
        const reportsCount = await Report.countDocuments({ status: 'pending' });

        // 3. Recent Bookings (Last 5)
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({ path: 'service', select: 'title category' })
            .populate({ path: 'tourist', select: 'name email photo' });

        // 4. Category Stats (Services per Category)
        const categoryStats = await Service.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                revenue,
                usersCount,
                servicesCount,
                bookingsCount,
                reportsCount,
                recentBookings,
                categoryStats
            }
        });
    } catch (err) {
        next(err);
    }
};

// Create a new report (any authenticated user)
exports.createReport = async (req, res, next) => {
    try {
        const { targetType, targetId, reason, details } = req.body;

        if (!targetType || !targetId || !reason) {
            return next(new AppError('Please provide targetType, targetId, and reason', 400));
        }

        const reportData = {
            reporter: req.user.id,
            targetType,
            reason,
            details: details || ''
        };

        // Set the correct target reference
        if (targetType === 'service') {
            const service = await Service.findById(targetId);
            if (!service) {
                return next(new AppError('Service not found', 404));
            }
            reportData.targetService = targetId;
        } else if (targetType === 'user') {
            const user = await User.findById(targetId);
            if (!user) {
                return next(new AppError('User not found', 404));
            }
            reportData.targetUser = targetId;
        }

        const report = await Report.create(reportData);

        res.status(201).json({
            status: 'success',
            message: 'Report submitted successfully',
            data: { report }
        });
    } catch (err) {
        next(err);
    }
};

// Get all reports (Admin only)
exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: reports.length,
            data: { reports }
        });
    } catch (err) {
        next(err);
    }
};

// Update report status (Admin only)
exports.updateReport = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            {
                status,
                adminNotes,
                resolvedBy: req.user.id,
                resolvedAt: status === 'resolved' ? Date.now() : undefined
            },
            { new: true, runValidators: true }
        );

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { report }
        });
    } catch (err) {
        next(err);
    }
};
