




import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';

const DocumentPage = () => {
    const { id: documentId } = useParams();
    const socket = useSocket();
    const [documentTitle, setDocumentTitle] = useState(''); // To store the title
    const [content, setContent] = useState('');
    const [versions, setVersions] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [versionLabel, setVersionLabel] = useState('');

    // Fetch the latest saved version or empty content
    const fetchDocument = async () => {
        const token = localStorage.getItem('token');
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/documents/${documentId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setContent(data.content || ''); // Default to an empty string if no content
            setDocumentTitle(data.title || 'Untitled Document'); // Set the document title
        } catch (err) {
            console.error('Error fetching document:', err);
        }
    };

    // Fetch saved versions of the document
    const fetchVersions = async () => {
        const token = localStorage.getItem('token');
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/documents/${documentId}/versions`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setVersions(data); // Set the list of saved versions
        } catch (err) {
            console.error('Error fetching versions:', err);
        }
    };

    const handleSaveVersion = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/documents/${documentId}`,
                { content, label: versionLabel },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            alert('Version saved successfully!');
            setVersionLabel(''); // Reset the version label input
    
            // Emit the save-version event to notify all clients
            socket.emit('save-version', { documentId });
    
        } catch (err) {
            console.error('Error saving version:', err);
        }
    };

    const handleLoadVersion = async (versionId) => {
        const token = localStorage.getItem('token');
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/documents/${documentId}/versions/${versionId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setContent(data.content); // Set the content of the clicked version
        } catch (err) {
            console.error('Error loading version:', err);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const user = JSON.parse(localStorage.getItem('user')); // Retrieve user info

        console.log(user);

        // if (!user || !user.id) {
        //     console.error('User information not found in local storage');
        //     return;
        // } 

        // Join the document room
        socket.emit('join-document', { documentId, user });       

        // Listen for active users
        socket.on('active-users', (users) => {
            setActiveUsers(users);
        });

        // Listen for real-time content changes
        socket.on('receive-changes', (changes) => {
            setContent(changes);
        });

        socket.on('version-updated', (updatedVersions) => {
            console.log('Received updated versions:', updatedVersions);
            setVersions(updatedVersions);
        });

        return () => {
            socket.off('active-users');
            socket.off('receive-changes');
        };
    }, [socket, documentId]);

    const handleChange = (e) => {
        setContent(e.target.value);
        socket.emit('send-changes', { documentId, changes: e.target.value });
    };

    useEffect(() => {
        fetchDocument();
        fetchVersions();
    }, [documentId]);

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                {documentTitle} {/* Display the dynamic title */}
            </Typography>
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6">Active Users ({activeUsers.length})</Typography>
                <List>
                    {activeUsers.map((user, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={user.email} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6">Document Content</Typography>
                <TextField
                    value={content}
                    onChange={handleChange}
                    multiline
                    fullWidth
                    rows={10}
                    placeholder="Start writing here..."
                    sx={{ marginBottom: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Version Label"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        size="small"
                    />
                    <Button variant="contained" color="primary" onClick={handleSaveVersion}>
                        Save Version
                    </Button>
                </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h6">Saved Versions</Typography>
                <List>
                    {versions.map((version, index) => (
                        <React.Fragment key={index}>
                            <ListItem>
                                <ListItemText
                                    primary={version.label || 'No Label'}
                                    secondary={new Date(version.timestamp).toLocaleString()}
                                />
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleLoadVersion(version._id)}
                                >
                                    Load
                                </Button>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default DocumentPage;
