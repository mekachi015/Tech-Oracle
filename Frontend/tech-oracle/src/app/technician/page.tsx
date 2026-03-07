"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TechnicianDashboard from "@/components/technician-dashboard";
import ClientWrapper from "../clientWrapper";
import MUIProvider from '@/app/theme-provider';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
} from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';

export default function TechnicianPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if already authenticated with valid token
    useEffect(() => {
        const token = sessionStorage.getItem('technicianToken');
        if (token) {
            // Token exists, assume authenticated (dashboard will verify on API calls)
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid password');
            }

            const data = await response.json();
            // Store JWT token in sessionStorage
            sessionStorage.setItem('technicianToken', data.access_token);
            setIsAuthenticated(true);
            setPassword('');
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('technicianToken');
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <MUIProvider>
                <ClientWrapper>
                    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                p: { xs: 3, sm: 4 },
                                textAlign: 'center'
                            }}
                        >
                            <LockIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 2 }} />
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                                Technician Portal
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                Please enter your password to access the dashboard
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                            <form onSubmit={handleLogin}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    variant="outlined"
                                    autoFocus
                                    sx={{ mb: 3 }}
                                />
                                
                                {error && (
                                    <Alert severity="error" sx={{ mb: 3 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading || !password}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        py: { xs: 1.2, sm: 1.5 },
                                    }}
                                >
                                    {loading ? 'Authenticating...' : 'Access Dashboard'}
                                </Button>

                                <Typography variant="caption" display="block" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    Authorized personnel only
                                </Typography>
                            </form>
                        </CardContent>
                    </Card>
                </Container>
            </ClientWrapper>
            </MUIProvider>
        );
    }

    return (
        <MUIProvider>
            <ClientWrapper>
            <Box sx={{ position: 'relative' }}>
                <Box sx={{ 
                    position: { xs: 'relative', sm: 'absolute' },
                    top: { sm: 16 },
                    right: { sm: 16 },
                    zIndex: 1000,
                    display: 'flex',
                    gap: 1,
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    p: { xs: 2, sm: 0 },
                    flexWrap: 'wrap'
                }}>
                    <Link href="/" passHref legacyBehavior>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<HomeIcon />}
                            sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { xs: 120 } }}
                        >
                            Home
                        </Button>
                    </Link>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLogout}
                        size="small"
                        sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { xs: 120 } }}
                    >
                        Logout
                    </Button>
                </Box>
                <TechnicianDashboard />
            </Box>
        </ClientWrapper>
        </MUIProvider>
    );
}
