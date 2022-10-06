const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,userLeaves, getCurrentUser, getRoomUsers} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// run when a client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.join()
        // welcome the current user
        socket.emit('user-notifications', 
                `...Welcome to the  ||noise.cord||  ${user.room} chat...`);

        // broadcast user connection to other users
        socket.broadcast.to(user.room).emit('user-notifications', 
                `...${user.username} has joined the ${user.room} chat...`);
    });

    // Listen for chat messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // running when a user disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);

        if(user){
            io.to(user.room).emit('user-notifications', 
                `...${user.username} has left the ${user.room} chat...`);
        }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));