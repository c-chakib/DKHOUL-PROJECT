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

        // Sanitize targetId
        const safeTargetId = String(targetId);

        // Set the correct target reference
        if (targetType === 'service') {
            const service = await Service.findById(safeTargetId);
            if (!service) {
                return next(new AppError('Service not found', 404));
            }
            reportData.targetService = safeTargetId;
        } else if (targetType === 'user') {
            const user = await User.findById(safeTargetId);
            if (!user) {
                return next(new AppError('User not found', 404));
            }
            reportData.targetUser = safeTargetId;
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

// --- GOD MODE: USER MANAGEMENT ---

// 1. Get All Users (Exclude passwords)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (err) {
        next(err);
    }
};

// 2. Delete User (Anti-Suicide Protected)
exports.deleteUser = async (req, res, next) => {
    try {
        // Anti-Suicide Check
        if (req.params.id === req.user.id) {
            return next(new AppError('Vous ne pouvez pas supprimer votre propre compte !', 400));
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Emit Socket Event for Admin Dashboard
        try {
            const socketModule = require('../socket');
            const io = socketModule.getIO();
            io.emit('user-deleted', { _id: req.params.id });
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr.message);
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

// 3. Force Password Reset
exports.resetUserPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return next(new AppError('Password must be at least 8 characters', 400));
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        user.passwordConfirm = newPassword; // Required by model validation
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password successfully reset.',
            data: { user } // Return user to confirm
        });
    } catch (err) {
        next(err);
    }
};
