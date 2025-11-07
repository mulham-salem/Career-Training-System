import { Express } from 'express';
import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const initSocket = (app: Express, server: http.Server): Server => {
    io = new Server(server, {
        cors: {
            origin: "*", //"http://localhost:5173"
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        console.log("🟢 User connected:", socket.id);

        socket.on("register", (userId: number) => {
            socket.join(String(userId));
            console.log(`User ${userId} joined room ${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};