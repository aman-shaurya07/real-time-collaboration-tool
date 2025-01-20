// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState({});
    const [editing, setEditing] = useState(false);
    const [updatedEmail, setUpdatedEmail] = useState('');
    const [updatedUsername, setUpdatedUsername] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUser(user);
        setUpdatedEmail(user.email);
        setUpdatedUsername(user.username);
    }, []);

    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        try {
            const { data } = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/update-profile`,
                { email: updatedEmail, username: updatedUsername },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(data);
            setEditing(false);
            localStorage.setItem('user', JSON.stringify(data)); // Update local storage
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>
            {!editing ? (
                <div>
                    <Typography variant="body1">
                        <strong>Username:</strong> {user.username}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Email:</strong> {user.email}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setEditing(true)}
                        style={{ marginTop: '10px' }}
                    >
                        Edit Profile
                    </Button>
                </div>
            ) : (
                <div>
                    <TextField
                        label="Username"
                        value={updatedUsername}
                        onChange={(e) => setUpdatedUsername(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        value={updatedEmail}
                        onChange={(e) => setUpdatedEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdate}
                        style={{ marginTop: '10px', marginRight: '10px' }}
                    >
                        Save
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setEditing(false)}
                        style={{ marginTop: '10px' }}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default Profile;
