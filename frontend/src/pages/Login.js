import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Route based on user role
            if (result.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            ESG Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to access your dashboard
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="email"
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link component={RouterLink} to="/signup" underline="hover">
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
