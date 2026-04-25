const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Optimization & Security
const helmet = require('helmet');
const compression = require('compression');

mongoose.set('strictQuery', false);

const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Production CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const io = socketIo(server, {
  cors: {
    origin: "*", // More flexible for initial deployment
    methods: ["GET", "POST"]
  }
});

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime() 
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('CRITICAL: MONGO_URI is not defined.');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    // Don't exit(1) immediately to allow Render to stay "alive" for debugging
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/applications', require('./routes/applications'));

// Socket.io Logic
const users = {}; 

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register', (userId) => {
    if (!userId) return;
    users[userId] = socket.id;
    console.log(`User registered: ${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, text, imageUrl } = data;
    if (!senderId || !receiverId || (!text && !imageUrl)) return;
    
    try {
      const newMessage = new Message({ 
        sender: senderId, 
        receiver: receiverId, 
        text: text || '', 
        imageUrl: imageUrl || '' 
      });
      await newMessage.save();

      const receiverSocketId = users[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }
      
      socket.emit('messageSent', newMessage);
    } catch (err) {
      console.error('Socket sendMessage error:', err);
    }
  });

  socket.on('disconnect', () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
