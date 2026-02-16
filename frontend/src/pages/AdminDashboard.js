import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    Fade,
    Grow
} from '@mui/material';
import {
    Add,
    Delete,
    Logout,
    Business,
    Upload,
    DarkMode,
    LightMode,
    TrendingUp,
    Assessment,
    Visibility
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { companiesAPI } from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: '',
        website: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await companiesAPI.getAll();
            const validCompanies = (response.data.companies || []).filter(c => c && c._id);
            setCompanies(validCompanies);
        } catch (err) {
            setError('Failed to load companies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleOpenDialog = () => {
        setFormData({ name: '', description: '', industry: '', website: '' });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            await companiesAPI.create(formData);
            setOpenDialog(false);
            fetchCompanies();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create company');
        }
    };

    const handleDelete = async (id, name) => {
        // Validate ID exists
        if (!id || id === 'undefined' || id === 'null') {
            // Try cleanup endpoint for corrupted companies
            if (window.confirm(`"${name}" appears to be corrupted. Delete it using cleanup method?`)) {
                try {
                    const response = await companiesAPI.cleanup(name);
                    if (response.data.success) {
                        setError('');
                        fetchCompanies();
                    }
                } catch (err) {
                    console.error('Cleanup failed:', err);
                    const errorMessage = err.response?.data?.message || 'Failed to delete corrupted company.';
                    setError(errorMessage);
                    setTimeout(() => setError(''), 5000);
                }
            }
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${name}? This will also delete all associated reports.`)) {
            try {
                console.log('Deleting company:', { id, name });
                const response = await companiesAPI.delete(id);
                if (response.data.success) {
                    setError('');
                    fetchCompanies();
                }
            } catch (err) {
                console.error('Delete error:', err);
                const errorMessage = err.response?.data?.message || 'Failed to delete company. Please try again.';
                setError(errorMessage);
                // Show error for 5 seconds
                setTimeout(() => setError(''), 5000);
            }
        }
    };

    const handleUpload = (companyId) => {
        navigate(`/admin/upload/${companyId}`);
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'success';
        if (score >= 50) return 'warning';
        return 'error';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Modern AppBar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Toolbar sx={{ py: 1 }}>
                    <Business sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        ESG Analytics
                    </Typography>

                    <Chip
                        label="Admin"
                        color="primary"
                        size="small"
                        sx={{ mr: 2, fontWeight: 600 }}
                    />

                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 36, height: 36 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                        {user?.name}
                    </Typography>

                    <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
                        {mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>

                    <Button
                        color="inherit"
                        onClick={handleLogout}
                        startIcon={<Logout />}
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                        Logout
                    </Button>
                    <IconButton
                        onClick={handleLogout}
                        sx={{ display: { xs: 'flex', md: 'none' } }}
                    >
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Section */}
                <Fade in timeout={500}>
                    <Box mb={4}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box>
                                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                                    Company Management
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Create and manage companies, upload sustainability reports
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenDialog}
                                size="large"
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    boxShadow: 3
                                }}
                            >
                                Add Company
                            </Button>
                        </Box>

                        {/* Stats Cards */}
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{
                                    background: mode === 'dark'
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}>
                                    <CardContent>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Total Companies
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                                            {companies.length}
                                        </Typography>
                                        <TrendingUp />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{
                                    background: mode === 'dark'
                                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white'
                                }}>
                                    <CardContent>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Total Reports
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                                            {companies.reduce((sum, c) => sum + (c.reportCount || 0), 0)}
                                        </Typography>
                                        <Assessment />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Companies Grid */}
                {companies.length === 0 ? (
                    <Fade in timeout={700}>
                        <Card sx={{ p: 6, textAlign: 'center' }}>
                            <Business sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                No companies yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Click "Add Company" to create your first company
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenDialog}
                            >
                                Add Your First Company
                            </Button>
                        </Card>
                    </Fade>
                ) : (
                    <Grid container spacing={3}>
                        {companies.map((company, index) => (
                            <Grow in timeout={300 + index * 100} key={company._id || index}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'visible'
                                        }}
                                    >
                                        {company.latestScores?.overall && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: -10,
                                                    right: 16,
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: 2,
                                                    fontWeight: 700,
                                                    boxShadow: 2
                                                }}
                                            >
                                                {company.latestScores.overall}
                                            </Box>
                                        )}

                                        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600 }}>
                                                {company.name}
                                            </Typography>

                                            {company.industry && (
                                                <Chip
                                                    label={company.industry}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ mb: 2 }}
                                                />
                                            )}

                                            {company.description && (
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {company.description.substring(0, 100)}
                                                    {company.description.length > 100 ? '...' : ''}
                                                </Typography>
                                            )}

                                            <Box mt={2} display="flex" gap={2}>
                                                <Chip
                                                    label={`${company.reportCount || 0} Reports`}
                                                    size="small"
                                                    variant="filled"
                                                />
                                                {company.latestScores?.lastUpdated && (
                                                    <Chip
                                                        label={`Score: ${company.latestScores.overall}`}
                                                        size="small"
                                                        color={getScoreColor(company.latestScores.overall)}
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>

                                        <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<Visibility />}
                                                onClick={() => navigate(`/company/${company._id}`)}
                                            >
                                                View Analysis
                                            </Button>
                                            <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={<Upload />}
                                                    onClick={() => handleUpload(company._id)}
                                                    sx={{ flexGrow: 1 }}
                                                >
                                                    Upload Report
                                                </Button>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(company._id, company.name)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            </Grow>
                        ))}
                    </Grid>
                )}

                {/* Create Company Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700 }}>Add New Company</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Company Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            label="Website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            margin="normal"
                            type="url"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AdminDashboard;
