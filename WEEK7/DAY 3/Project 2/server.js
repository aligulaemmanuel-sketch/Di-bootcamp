const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

async function updateRoomUsers(room) {
    const sockets = await io.in(room).fetchSockets();
    io.to(room).emit('user-list', sockets.map((socket) => socket.data.username).filter(Boolean));
}

io.on('connection', (socket) => {
    socket.on('join-room', async ({ username, room } = {}) => {
        const cleanUsername = String(username || '').trim();
        const cleanRoom = String(room || '').trim();
        if (!cleanUsername || !cleanRoom) return;

        if (socket.data.room) {
            const previousRoom = socket.data.room;
            socket.leave(previousRoom);
            await updateRoomUsers(previousRoom);
        }

        socket.data.username = cleanUsername;
        socket.data.room = cleanRoom;
        socket.join(cleanRoom);
        io.to(cleanRoom).emit('message', { user: 'System', text: `${cleanUsername} joined` });
        await updateRoomUsers(cleanRoom);
    });

    socket.on('chat-message', (text) => {
        if (!socket.data.room || !socket.data.username) return;
        io.to(socket.data.room).emit('message', {
            user: socket.data.username,
            text: String(text)
        });
    });

    socket.on('disconnect', async () => {
        const { room, username } = socket.data;
        if (!room || !username) return;
        io.to(room).emit('message', { user: 'System', text: `${username} left` });
        await updateRoomUsers(room);
    });
});

server.listen(port, () => {
    console.log(`Chat server running at http://localhost:${port}`);
});
