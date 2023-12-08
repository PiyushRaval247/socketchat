import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();
// Configure dotenv to read the .env file

// const io = new Server(5000, {
//     cors: {
//         origin: 'http://localhost:3000',
//     }, 
// }
const port= process.env.PORT;
const origin = process.env.ORIGIN;

const io = new Server(port,{

    cors: {origin},
  });

let users = [];

const addUser = (userData, socketId) => {
    !users.some(user => user.sub === userData.sub) && users.push({ ...userData, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user.sub === userId);
}

io.on('connection',  (socket) => {
    console.log('user connected')

    //connect
    socket.on("addUser", userData => {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
    })

    //send message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);
        io.to(user.socketId).emit('getMessage', data)
    })

    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    })
})