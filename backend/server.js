const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

dotenv.config();
connectDB();
const app = express(); 
app.use(express.json()); // to accept JSON Data

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`.yellow.bold));

// Socket.io setup
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User joined Room:', room);
  });

  //create a socket fro typing

  

  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log('Chat.users not defined');

    chat.users.forEach((user) => {
      // if I am the sender, don't send the message to myself
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.off('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

//------------------DEPLOYMENT--------------------

  const __dirname2=path.resolve();
  if(process.env.NODE_ENV==='production')
    {
      //establishing a path from current working directory to the build folder of frontend.
     app.use(express.static(path.join(__dirname2,"/frontend/build")));
     app.get('*',(req,res)=>{
      res.sendFile(path.resolve(__dirname2,"frontend","build","index.html"));
     }) 
    }
    else
    {
      app.get("/",(req,res)=>{
        res.send("API is running successfully");
      });
    }

  //----------------DEPLOYMENT--------------------

// Error handling middleware
app.use(notFound);
app.use(errorHandler);
