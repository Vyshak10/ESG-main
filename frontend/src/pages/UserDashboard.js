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
    Chip
} from '@mui/material';
import { Search, Logout, Business } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';
import ESGScoreCard from '../components/ESGScoreCard';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Business sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        ESG Analytics - Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        {user?.name}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box mb={4}>
                    <Typography variant="h4" gutterBottom>
                        Company ESG Reports
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        View and analyze ESG performance across all companies
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    placeholder="Search companies by name or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 4 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        )
                    }}
                />

                {filteredCompanies.length === 0 ? (
                    <Alert severity="info">
                        No companies found. {searchTerm ? 'Try a different search term.' : 'Ask an admin to add companies.'}
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {filteredCompanies.map((company) => (
                            <Grid item xs={12} sm={6} md={4} key={company._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        }
                                    }}
                                >
                                    <CardActionArea onClick={() => navigate(`/company/${company._id}`)}>
                                        <CardContent>
                                            <Typography variant="h5" component="div" gutterBottom>
                                                {company.name}
                                            </Typography>

                                            {company.industry && (
                                                <Chip
                                                    label={company.industry}
                                                    size="small"
                                                    sx={{ mb: 2 }}
                                                />
                                            )}

                                            {company.latestScores.lastUpdated ? (
                                                <>
                                                    <Box sx={{ my: 2 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Overall ESG Score
                                                            </Typography>
                                                            <Chip
                                                                label={company.latestScores.overall}
                                                                color={getScoreColor(company.latestScores.overall)}
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </Box>

                                                    <Grid container spacing={1}>
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography variant="caption" color="text.secondary">
                                                                    E
                                                                </Typography>
                                                                <Typography variant="h6" color="success.main">
                                                                    {company.latestScores.environmental}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography variant="caption" color="text.secondary">
                                                                    S
                                                                </Typography>
                                                                <Typography variant="h6" color="primary.main">
                                                                    {company.latestScores.social}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography variant="caption" color="text.secondary">
                                                                    G
                                                                </Typography>
                                                                <Typography variant="h6" color="warning.main">
                                                                    {company.latestScores.governance}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                                                        Last updated: {new Date(company.latestScores.lastUpdated).toLocaleDateString()}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Alert severity="info" sx={{ mt: 2 }}>
                                                    No reports available yet
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default UserDashboard;
