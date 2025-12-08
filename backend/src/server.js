const dotenv = require('dotenv');
const colors = require('colors');
const http = require('http');
const { Server } = require('socket.io');

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// Connect to Database
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

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

(async () => {
    await connectDB();
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
