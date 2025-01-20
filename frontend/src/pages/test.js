// Socket.io Setup
// io.on('connection', (socket) => {
//     console.log(`New client connected: ${socket.id}`);
//     logger.info(`New client connected: ${socket.id}`);


//     // Join a room for a specific document
//     socket.on('join-document', ({ documentId, user }) => {
//         try {
//             socket.join(documentId);

//             if (!rooms[documentId]) rooms[documentId] = [];

//             // Check if the user is already in the room
//             const isUserInRoom = rooms[documentId].some((u) => u.id === user.id);
//             if (!isUserInRoom) {
//                 rooms[documentId].push({ id: user.id, email: user.email, socketId: socket.id });
//             }

//             // Emit the active users in the room to all clients
//             io.to(documentId).emit('active-users', rooms[documentId]);
//             console.log(`Active users in document ${documentId}:`, rooms[documentId]);
//             logger.info(`User ${user.email} joined document ${documentId}`);

//         } catch (err) {
//             console.error(`Error joining document: ${err.message}`);
//             logger.error(`Error in join-document: ${err.message}`);

//         }
//     });

//     // Handle content changes
//     socket.on('send-changes', ({ documentId, changes }) => {
//         try {
//             socket.to(documentId).emit('receive-changes', changes);
//         } catch (err) {
//             console.error(`Error sending changes: ${err.message}`);
//         }
//     });


//     // socket.on('add-collaborator', async ({ documentId }) => {
//     //     try {
//     //         // Fetch the updated document with the new collaborator
//     //         const updatedDocument = await Document.findById(documentId).populate('collaborators', 'email');
    
//     //         // Notify all clients in the room with the updated document
//     //         io.emit('collaborator-updated', updatedDocument);
//     //         console.log('Emitting collaborator-updated event for:', populatedDoc);
//     //     } catch (err) {
//     //         console.error(`Error broadcasting collaborator update: ${err.message}`);
//     //     }
//     // });

//     socket.on('add-collaborator', async ({ documentId }) => {
//         try {
//             // Fetch the updated document with the new collaborator
//             const updatedDocument = await Document.findById(documentId).populate('collaborators', 'email');
    
//             if (!updatedDocument) {
//                 console.error('Document not found');
//                 return;
//             }
    
//             // Notify all clients in the room with the updated document
//             io.to(documentId).emit('collaborator-updated', updatedDocument);
//             console.log(`Emitted collaborator-updated for document ${documentId}`);
//         } catch (err) {
//             console.error(`Error broadcasting collaborator update: ${err.message}`);
//         }
//     });
    
    
    
    




//     // Handle disconnection
//     socket.on('disconnect', () => {
//         logger.info(`Client disconnected: ${socket.id}`);
//         console.log(`Client disconnected: ${socket.id}`);
//         for (const [room, users] of Object.entries(rooms)) {
//             // Remove the disconnected user based on socketId
//             rooms[room] = users.filter((user) => user.socketId !== socket.id);

//             // Emit updated active users to all clients in the room
//             io.to(room).emit('active-users', rooms[room]);
//         }
//     });
// });