const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Booking = require('../src/models/Booking');
const Message = require('../src/models/Message');
const Service = require('../src/models/Service');
const jwt = require('jsonwebtoken');

describe('Chat Endpoints', () => {
    let senderToken;
    let senderId;
    let receiverId;

    beforeEach(async () => {
        const sender = await User.create({
            name: 'Sender User',
            email: 'sender@chat.com',
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'user'
        });
        senderId = sender._id;
        senderToken = jwt.sign({ id: sender._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const receiver = await User.create({
            name: 'Receiver User',
            email: 'receiver@chat.com',
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'guide'
        });
        receiverId = receiver._id;
    });

    it('should get chat history with a specific user', async () => {
        await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: 'Hello!',
            timestamp: Date.now()
        });

        const res = await request(app)
            .get(`/api/v1/chats/history/${receiverId}`)
            .set('Authorization', `Bearer ${senderToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.messages).toHaveLength(1);
        expect(res.body.data.messages[0].content).toEqual('Hello!');
    });

    it('should get chat contacts (based on bookings)', async () => {
        // Create a service and booking to link users
        const service = await Service.create({
            title: 'Chat Service',
            description: 'Desc',
            price: 100,
            category: 'SPACE',
            host: receiverId,
            location: { type: 'Point', coordinates: [0, 0] }
        });

        await Booking.create({
            service: service._id,
            tourist: senderId,
            status: 'confirmed',
            bookingDate: new Date(),
            price: 100,
            hours: 1
        });

        const res = await request(app)
            .get('/api/v1/chats/contacts')
            .set('Authorization', `Bearer ${senderToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.users).toHaveLength(1);
        expect(res.body.data.users[0]._id.toString()).toEqual(receiverId.toString());
    });
});
