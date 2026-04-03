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
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Lock as LockIcon,
    Home as HomeIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

// Custom CSS styles to match hero section theme
const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    .tech-login-container {
        min-height: 100vh;
        background: #05080f;
        font-family: 'DM Sans', sans-serif;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
    }

    .tech-login-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        pointer-events: none;
        will-change: transform;
    }
    .tech-login-orb-1 {
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%);
        top: -100px; left: -100px;
        animation: techOrbFloat1 18s ease-in-out infinite;
    }
    .tech-login-orb-2 {
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
        bottom: -80px; right: -80px;
        animation: techOrbFloat2 22s ease-in-out infinite;
    }

    @keyframes techOrbFloat1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, 20px) scale(1.05); }
    }
    @keyframes techOrbFloat2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-25px, -30px) scale(1.03); }
    }

    .tech-login-grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
        background-size: 50px 50px;
        pointer-events: none;
    }

    .tech-login-card {
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 16px;
        position: relative;
        z-index: 1;
        max-width: 480px;
        width: 100%;
        transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }

    .tech-login-card:hover {
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.12);
    }

    .tech-login-header {
        background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        color: #fff;
        padding: 32px 24px;
        text-align: center;
        border-radius: 16px 16px 0 0;
        position: relative;
        overflow: hidden;
    }

    .tech-login-header::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.3s;
    }

    .tech-login-header:hover::before {
        opacity: 1;
    }

    .tech-login-icon {
        font-size: 48px;
        margin-bottom: 16px;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    .tech-login-title {
        font-family: 'Syne', sans-serif;
        font-size: 2rem;
        font-weight: 800;
        margin: 0 0 8px 0;
        letter-spacing: -0.02em;
    }

    .tech-login-subtitle {
        font-size: 1rem;
        font-weight: 300;
        margin: 0;
        opacity: 0.9;
    }

    .tech-login-content {
        padding: 32px 24px;
    }

    .tech-login-field {
        margin-bottom: 24px;
    }

    .tech-login-input-wrapper {
        position: relative;
    }

    .tech-login-input {
        width: 100%;
        padding: 16px 48px 16px 18px;
        font-family: 'DM Sans', sans-serif;
        font-size: 1rem;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        color: #f0f4ff;
        transition: all 0.25s ease;
        box-sizing: border-box;
    }

    .tech-login-password-toggle {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        border: none;
        background: transparent;
        cursor: pointer;
        color: #94a3b8;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tech-login-password-toggle:hover {
        color: #fff;
    }

    .tech-login-input::placeholder {
        color: #64748b;
    }

    .tech-login-input:focus {
        outline: none;
        border-color: #60a5fa;
        background: rgba(255,255,255,0.08);
        box-shadow: 0 0 0 3px rgba(96,165,250,0.15);
    }

    .tech-login-input-adornment {
        color: #94a3b8;
    }

    .tech-login-btn {
        width: 100%;
        padding: 16px 28px;
        font-size: 1rem;
        font-weight: 500;
        font-family: 'DM Sans', sans-serif;
        background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        color: #fff;
        border: none;
        border-radius: 100px;
        cursor: pointer;
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(37,99,235,0.35);
        margin-top: 8px;
    }

    .tech-login-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.25s;
    }

    .tech-login-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(37,99,235,0.5);
    }

    .tech-login-btn:hover:not(:disabled)::before {
        opacity: 1;
    }

    .tech-login-btn:active {
        transform: translateY(0);
    }

    .tech-login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .tech-login-alert {
        margin-bottom: 24px;
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.2);
        border-radius: 12px;
        color: #fca5a5;
    }

    .tech-login-caption {
        text-align: center;
        margin-top: 24px;
        font-size: 0.85rem;
        color: #64748b;
    }
`;

export default function TechnicianPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                    <div className="tech-login-container">
                        {/* Ambient background orbs */}
                        <div className="tech-login-orb tech-login-orb-1"></div>
                        <div className="tech-login-orb tech-login-orb-2"></div>

                        {/* Grid lines */}
                        <div className="tech-login-grid"></div>

                        <div className="tech-login-card">
                            <div className="tech-login-header">
                                <LockIcon className="tech-login-icon" />
                                <h1 className="tech-login-title">Technician Portal</h1>
                                <p className="tech-login-subtitle">Please enter your password to access the dashboard</p>
                            </div>

                            <div className="tech-login-content">
                                <form onSubmit={handleLogin}>
                                    <div className="tech-login-field">
                                        <div className="tech-login-input-wrapper">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="tech-login-input"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                autoFocus
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="tech-login-password-toggle"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <Alert severity="error" className="tech-login-alert">
                                            {error}
                                        </Alert>
                                    )}

                                    <button
                                        type="submit"
                                        className="tech-login-btn"
                                        disabled={loading || !password}
                                    >
                                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                                    </button>

                                    <p className="tech-login-caption">
                                        Authorized personnel only
                                    </p>
                                </form>
                            </div>
                        </div>

                        <style dangerouslySetInnerHTML={{ __html: styles }} />
                    </div>
                </ClientWrapper>
            </MUIProvider>
        );
    }

    return (
        <MUIProvider>
            <ClientWrapper>
            <Box sx={{ position: 'relative' }}>
                <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 1,
                    backgroundColor: 'rgba(9, 13, 35, 0.85)',
                    borderBottom: '1px solid rgba(120, 160, 255, 0.35)',
                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(10px)',
                    flexWrap: 'wrap'
                }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<HomeIcon />}
                            sx={{ minWidth: 120, color: '#e7f1ff', borderColor: '#7ca7ff' }}
                        >
                            Home
                        </Button>
                    </Link>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLogout}
                        size="small"
                        sx={{ minWidth: 120, color: '#ffdddd', borderColor: '#ff7b7b' }}
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
