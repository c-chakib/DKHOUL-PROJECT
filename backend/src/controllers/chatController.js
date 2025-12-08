const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/appError');
const Booking = require('../models/Booking');

// Get conversation history between current user and another user
exports.getHistory = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort('timestamp');

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: {
                messages
            }
        });
    } catch (err) {
        next(new AppError('Failed to fetch chat history', 500));
    }
};

// Get list of users to chat with (based on bookings)
// This finds users who have bookings with the current user (either as host or tourist)
exports.getChatUsers = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const uniqueUsers = [];
        const seenIds = new Set();

        const addUsers = (usersList, roleContext) => {
            usersList.forEach(u => {
                // Ensure user exists and hasn't been added yet
                if (u && u._id && !seenIds.has(u._id.toString())) {
                    seenIds.add(u._id.toString());
                    uniqueUsers.push({
                        _id: u._id,
                        name: u.name,
                        photo: u.photo,
                        email: u.email,
                        role: roleContext // 'HOST' or 'TOURIST' (who they are to me)
                    });
                }
            });
        };

        // 1. I am the Tourist: Find Hosts I've booked
        const bookingsAsTourist = await Booking.find({ tourist: currentUserId }).populate({
            path: 'service',
            select: 'host', // Only need host field
            populate: { path: 'host', select: 'name photo email' }
        });

        const hosts = bookingsAsTourist
            .filter(b => b.service && b.service.host) // Safety check for deleted services/users
            .map(b => b.service.host);

        addUsers(hosts, 'HOST');

        // 2. I am the Host: Find Tourists who booked me
        // First find my services
        const Service = require('../models/Service');
        const myServices = await Service.find({ host: currentUserId }).select('_id');

        if (myServices.length > 0) {
            const myServiceIds = myServices.map(s => s._id);
            const bookingsAsHost = await Booking.find({ service: { $in: myServiceIds } })
                .populate('tourist', 'name photo email'); // Populate tourist details

            const tourists = bookingsAsHost
                .filter(b => b.tourist) // Safety check
                .map(b => b.tourist);

            addUsers(tourists, 'TOURIST');
        }

        res.status(200).json({
            status: 'success',
            data: {
                users: uniqueUsers
            }
        });

    } catch (err) {
        console.error('Chat Config Error:', err);
        next(new AppError('Failed to fetch chat contacts', 500));
    }
}
