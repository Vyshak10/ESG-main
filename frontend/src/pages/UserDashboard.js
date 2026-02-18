import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    Fade,
    Grow,
    IconButton,
    Paper
} from '@mui/material';
import {
    Search,
    Logout,
    Business,
    TrendingUp,
    TrendingDown,
    Remove,
    EmojiEvents,
    Nature,
    Groups,
    Gavel,
    DarkMode,
    LightMode,
    Compare
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { companiesAPI } from '../services/api';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = companies.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.industry.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCompanies(filtered);
        } else {
            setFilteredCompanies(companies);
        }
    }, [searchTerm, companies]);

    const fetchCompanies = async () => {
        try {
            const response = await companiesAPI.getAll();
            setCompanies(response.data.companies);
            setFilteredCompanies(response.data.companies);
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

    const getScoreColor = (score) => {
        if (score >= 70) return 'success';
        if (score >= 50) return 'warning';
        return 'error';
    };

    const getScoreGradient = (score) => {
        if (score >= 70) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        if (score >= 50) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    };

    const getScoreIcon = (score) => {
        if (score >= 70) return <TrendingUp />;
        if (score >= 50) return <Remove />;
        return <TrendingDown />;
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'E': return <Nature sx={{ fontSize: 20 }} />;
            case 'S': return <Groups sx={{ fontSize: 20 }} />;
            case 'G': return <Gavel sx={{ fontSize: 20 }} />;
            default: return null;
        }
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
            {/* Enhanced AppBar */}
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
                    <Business sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 700 }}>
                        ESG Analytics
                    </Typography>

                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 36, height: 36 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography variant="body2" sx={{ mr: 2, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                        {user?.name}
                    </Typography>

                    <IconButton
                        onClick={toggleTheme}
                        sx={{ mr: 1, color: 'text.primary' }}
                    >
                        {mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>

                    <Button
                        onClick={handleLogout}
                        startIcon={<Logout />}
                        sx={{ color: 'text.primary' }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 6 }}>
                {/* Hero Section */}
                <Fade in timeout={500}>
                    <Box mb={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                                    Company ESG Reports
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    View and analyze ESG performance across all companies
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Fade>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Enhanced Search Bar */}
                <Fade in timeout={700}>
                    <Paper elevation={3} sx={{ mb: 5, borderRadius: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Search companies by name or industry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '& fieldset': {
                                        border: 'none'
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ fontSize: 28, color: 'primary.main' }} />
                                    </InputAdornment>
                                ),
                                sx: { py: 2, fontSize: '1.1rem' }
                            }}
                        />
                    </Paper>
                </Fade>

                {/* Company Comparison Card */}
                <Fade in timeout={800}>
                    <Card
                        sx={{
                            mb: 5,
                            borderRadius: 4,
                            background: mode === 'dark'
                                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 20px 40px rgba(79, 172, 254, 0.4)'
                            }
                        }}
                        onClick={() => navigate('/compare')}
                    >
                        <CardActionArea>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={3}>
                                        <Box
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                borderRadius: 3,
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Compare sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                                                Compare Companies
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                View side-by-side ESG score comparisons with interactive charts
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <TrendingUp sx={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Fade>

                {filteredCompanies.length === 0 ? (
                    <Fade in timeout={900}>
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            No companies found. {searchTerm ? 'Try a different search term.' : 'Ask an admin to add companies.'}
                        </Alert>
                    </Fade>
                ) : (
                    <Grid container spacing={4}>
                        {filteredCompanies.map((company, index) => (
                            <Grow in timeout={300 + index * 100} key={company._id}>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            borderRadius: 4,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'visible',
                                            '&:hover': {
                                                transform: 'translateY(-12px)',
                                                boxShadow: mode === 'dark'
                                                    ? '0 20px 40px rgba(0,0,0,0.5)'
                                                    : '0 20px 40px rgba(0,0,0,0.15)'
                                            }
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => navigate(`/company/${company._id}`)}
                                            sx={{ height: '100%' }}
                                        >
                                            {/* Score Badge */}
                                            {company.latestScores?.overall && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -15,
                                                        right: 20,
                                                        background: getScoreGradient(company.latestScores.overall),
                                                        color: 'white',
                                                        width: 70,
                                                        height: 70,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                                        zIndex: 1
                                                    }}
                                                >
                                                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                                        {company.latestScores.overall}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                                        ESG
                                                    </Typography>
                                                </Box>
                                            )}

                                            <CardContent sx={{ p: 3, pt: 4 }}>
                                                {/* Company Name */}
                                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 1 }}>
                                                    {company.name}
                                                </Typography>

                                                {/* Industry Chip */}
                                                {company.industry && (
                                                    <Chip
                                                        label={company.industry}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            mb: 3,
                                                            fontWeight: 600,
                                                            borderRadius: 2
                                                        }}
                                                    />
                                                )}

                                                {company.latestScores.lastUpdated ? (
                                                    <>
                                                        {/* ESG Scores Grid */}
                                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                                            <Grid item xs={4}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        bgcolor: 'success.main',
                                                                        color: 'white',
                                                                        borderRadius: 3,
                                                                        transition: 'transform 0.2s',
                                                                        '&:hover': {
                                                                            transform: 'scale(1.05)'
                                                                        }
                                                                    }}
                                                                >
                                                                    {getCategoryIcon('E')}
                                                                    <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                                                                        Environmental
                                                                    </Typography>
                                                                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                                                                        {company.latestScores.environmental}
                                                                    </Typography>
                                                                </Paper>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        bgcolor: 'primary.main',
                                                                        color: 'white',
                                                                        borderRadius: 3,
                                                                        transition: 'transform 0.2s',
                                                                        '&:hover': {
                                                                            transform: 'scale(1.05)'
                                                                        }
                                                                    }}
                                                                >
                                                                    {getCategoryIcon('S')}
                                                                    <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                                                                        Social
                                                                    </Typography>
                                                                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                                                                        {company.latestScores.social}
                                                                    </Typography>
                                                                </Paper>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        bgcolor: 'warning.main',
                                                                        color: 'white',
                                                                        borderRadius: 3,
                                                                        transition: 'transform 0.2s',
                                                                        '&:hover': {
                                                                            transform: 'scale(1.05)'
                                                                        }
                                                                    }}
                                                                >
                                                                    {getCategoryIcon('G')}
                                                                    <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                                                                        Governance
                                                                    </Typography>
                                                                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                                                                        {company.latestScores.governance}
                                                                    </Typography>
                                                                </Paper>
                                                            </Grid>
                                                        </Grid>

                                                        {/* Last Updated */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                pt: 2,
                                                                borderTop: 1,
                                                                borderColor: 'divider'
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary">
                                                                Last updated
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                {new Date(company.latestScores.lastUpdated).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                        No reports available yet
                                                    </Alert>
                                                )}
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            </Grow>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default UserDashboard;
