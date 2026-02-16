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
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const result = await signup(
            formData.name,
            formData.email,
            formData.password,
            formData.role
        );

        if (result.success) {
            // Route based on role
            if (formData.role === 'admin') {
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
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Join ESG Analytics Platform
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
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoFocus
                        />

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

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                label="Role"
                            >
                                <MenuItem value="user">User (View Reports)</MenuItem>
                                <MenuItem value="admin">Admin (Upload & Manage)</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" underline="hover">
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Signup;
