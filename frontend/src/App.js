
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DocumentPage from './pages/DocumentPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

    return (
        <Router>
            {isAuthenticated && <Navbar />}
            <Routes>
                {/* <Route path="/" element={<Home />} /> */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route path="/documents/:id" element={<DocumentPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    );
};

export default App;

