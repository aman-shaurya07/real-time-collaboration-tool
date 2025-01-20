

const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const logger = require('./utils/logger');


dotenv.config();

const rooms = {}; // Store users for each room (document)

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });






    const Document = require('./models/Document'); // Import the Document model

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);
    
        // Join a room for a specific document
        socket.on('join-document', ({ documentId, user }) => {
            try {
                socket.join(documentId);
    
                if (!rooms[documentId]) rooms[documentId] = [];
    
                const isUserInRoom = rooms[documentId].some((u) => u.id === user.id);
                if (!isUserInRoom) {
                    rooms[documentId].push({ id: user.id, email: user.email, socketId: socket.id });
                }
    
                io.to(documentId).emit('active-users', rooms[documentId]);
                console.log(`Active users in document ${documentId}:`, rooms[documentId]);
            } catch (err) {
                console.error(`Error joining document: ${err.message}`);
            }
        });
    
        // Handle content changes
        socket.on('send-changes', ({ documentId, changes }) => {
            try {
                socket.to(documentId).emit('receive-changes', changes);
            } catch (err) {
                console.error(`Error sending changes: ${err.message}`);
            }
        });
    
        // Handle adding a collaborator
        socket.on('add-collaborator', async ({ documentId }) => {
            try {
                // Fetch the updated document with the new collaborator
                const updatedDocument = await Document.findById(documentId).populate('collaborators', 'email');
    
                if (!updatedDocument) {
                    console.error(`Document with ID ${documentId} not found`);
                    return;
                }
    
                // Emit the updated document to all clients in the room
                io.emit('collaborator-updated', updatedDocument);
                console.log(`Emitted collaborator-updated for document ${documentId}`);
            } catch (err) {
                console.error(`Error broadcasting collaborator update: ${err.message}`);
            }
        });

        socket.on('save-version', async ({ documentId }) => {
            try {
                // Fetch the updated document versions
                const updatedVersions = await Document.findById(documentId).select('versions');
        
                // Emit the updated versions to all clients in the same document room
                io.to(documentId).emit('version-updated', updatedVersions.versions);
                console.log(`Emitting version-updated event for document: ${documentId}`);
            } catch (err) {
                console.error(`Error broadcasting version update: ${err.message}`);
            }
        });
        
    
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            for (const [room, users] of Object.entries(rooms)) {
                rooms[room] = users.filter((user) => user.socketId !== socket.id);
                io.to(room).emit('active-users', rooms[room]);
            }
        });
    });
    




// Default route
app.get('/', (req, res) => {
    res.send('Real-Time Collaboration Tool Backend');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "Healthy", timestamp: new Date().toISOString() });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5100;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
