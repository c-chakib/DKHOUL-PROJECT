const dotenv = require('dotenv');
require('colors');
const http = require('http');
const { Server } = require('socket.io');

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err); // Log full error object including stack
    process.exit(1);
});

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { initRedis } = require('./services/cache.service');

const Message = require('./models/Message');

// Connect to Database
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"];
const socketModule = require('./socket');
const io = socketModule.init(server, corsOrigin);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`.green);

    socket.on('join_chat', (userId) => {
        socket.join(userId);
        console.log(`User with ID: ${socket.id} joined personal room: ${userId}`);
    });

    socket.on('send_message', async (data) => {
        const { receiverId, message, senderId } = data;
        try {
            const newMessage = await Message.create({
                sender: senderId,
                receiver: receiverId,
                content: message,
                timestamp: Date.now()
            });
            io.to(receiverId).emit('new_message', { ...newMessage.toObject(), senderId });
        } catch (err) {
            console.error('Error saving message:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

const { initBackupScheduler } = require('./utils/backupScheduler');

// Trigger Restart for Redis Connection
(async () => {
    await connectDB();
    await initRedis();
    initBackupScheduler();
    server.listen(PORT, () => {
        console.log(
            `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
        );
    });
})();

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
