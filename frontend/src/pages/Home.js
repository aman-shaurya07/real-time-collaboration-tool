












// src/components/Home.js
import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    CardActions,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const navigate = useNavigate();
    const socket = useSocket();



    useEffect(() => {
        const fetchDocuments = async () => {
            const token = localStorage.getItem('token');
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/documents`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDocuments(data);
            } catch (err) {
                console.error('Error fetching documents:', err);
            }
        };
    
        fetchDocuments();
    
        if (socket) {
            socket.on('collaborator-updated', (updatedDocument) => {
                console.log('Received collaborator-updated event:', updatedDocument); // Add this log
                setDocuments((prevDocs) =>
                    prevDocs.map((doc) =>
                        doc._id === updatedDocument._id ? updatedDocument : doc
                    )
                );
            });
        }
    
        return () => {
            if (socket) socket.off('collaborator-updated');
        };
    }, [socket]);
    
    
    
    


    const handleCreateDocument = async () => {
        const token = localStorage.getItem('token');
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/documents`,
                { title: newTitle },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDocuments((prev) => [...prev, data]);
            setNewTitle('');
        } catch (err) {
            console.error('Error creating document:', err);
        }
    };



    const handleAddCollaborator = async (documentId, collaboratorEmail) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/documents/${documentId}/add-collaborator`,
                { collaboratorEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            // Emit the collaborator addition event
            socket.emit('add-collaborator', { documentId });
    
            alert('Collaborator added successfully!');
        } catch (err) {
            console.error('Error adding collaborator:', err);
            alert('Failed to add collaborator. Ensure the email is registered.');
        }
    };
    


    

    return (
        <div>

            {/* Main Content */}
            <div style={{ padding: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Your Documents
                </Typography>

                <div style={{ marginBottom: '20px' }}>
                    <TextField
                        label="New Document Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        variant="outlined"
                        size="small"
                        style={{ marginRight: '10px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateDocument}
                    >
                        Create Document
                    </Button>
                </div>

                {/* Document Listing */}
                <Grid container spacing={3}>
                    {documents.map((doc) => (
                        <Grid item xs={12} sm={6} md={4} key={doc._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {doc.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Collaborators: {doc.collaborators.map((c) => c.email).join(', ')}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => navigate(`/documents/${doc._id}`)}
                                    >
                                        Open
                                    </Button>
                                    <TextField
                                        placeholder="Add Collaborator Email"
                                        size="small"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddCollaborator(doc._id, e.target.value);
                                                e.target.value = ''; // Clear the input field
                                            }
                                        }}
                                    />
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </div>
        </div>
    );
};

export default Home;
