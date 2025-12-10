let io;

module.exports = {
    init: (httpServer, corsOrigin) => {
        const { Server } = require("socket.io");
        io = new Server(httpServer, {
            cors: {
                origin: corsOrigin,
                methods: ["GET", "POST"]
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
