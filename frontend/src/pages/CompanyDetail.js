import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton
} from '@mui/material';
import { ArrowBack, Language, Business, DarkMode, LightMode, Refresh } from '@mui/icons-material';
import { companiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import ESGScoreCard from '../components/ESGScoreCard';
import { ESGPieChart, ESGBarChart, GreenwashingRiskIndicator } from '../components/Charts';
import ReportCard from '../components/ReportCard';
import ESGTrendChart from '../components/ESGTrendChart';

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const [company, setCompany] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Determine correct dashboard route based on user role
    const dashboardRoute = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

    useEffect(() => {
        fetchCompanyDetails();

        // Auto-refresh every 10 seconds to catch new reports
        const intervalId = setInterval(() => {
            fetchCompanyDetails(true); // Silent refresh
        }, 10000);

        return () => clearInterval(intervalId);
    }, [id]);

    const fetchCompanyDetails = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const response = await companiesAPI.getById(id);
            setCompany(response.data.company);
            setReports(response.data.reports);
            setError('');
        } catch (err) {
            if (!silent) {
                setError('Failed to load company details');
            }
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !company) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'Company not found'}</Alert>
                <Button onClick={() => navigate(dashboardRoute)} sx={{ mt: 2 }}>
                    Back to Dashboard
                </Button>
            </Container>
        );
    }

    const hasScores = company.latestScores.lastUpdated;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
                <Toolbar>
                    <Button
                        onClick={() => navigate(dashboardRoute)}
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.primary' }}
                    >
                        Back
                    </Button>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2, fontWeight: 600 }}>
                        {company.name}
                    </Typography>
                    {refreshing && (
                        <Chip
                            label="Refreshing..."
                            size="small"
                            color="primary"
                            sx={{ mr: 2 }}
                        />
                    )}
                    <IconButton
                        onClick={() => fetchCompanyDetails()}
                        title="Refresh data"
                        sx={{ color: 'text.primary' }}
                    >
                        <Refresh />
                    </IconButton>
                    <IconButton
                        onClick={toggleTheme}
                        sx={{ color: 'text.primary' }}
                    >
                        {mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Company Header */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Business sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h3" gutterBottom>
                                {company.name}
                            </Typography>
                            {company.industry && (
                                <Chip label={company.industry} color="primary" />
                            )}
                        </Box>
                    </Box>

                    {company.description && (
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {company.description}
                        </Typography>
                    )}

                    {company.website && (
                        <Button
                            startIcon={<Language />}
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit Website
                        </Button>
                    )}
                </Paper>

                {!hasScores ? (
                    <Alert severity="info">
                        No ESG reports have been processed for this company yet.
                    </Alert>
                ) : (
                    <>
                        {/* All ESG Scores in One Card */}
                        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                ESG Performance Scores
                            </Typography>

                            <Grid container spacing={3}>
                                {/* Overall Score */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <ESGScoreCard
                                        title="Overall ESG Score"
                                        score={company.latestScores.overall}
                                        subtitle={`Last updated: ${new Date(company.latestScores.lastUpdated).toLocaleDateString()}`}
                                        showGrade={true}
                                    />
                                </Grid>

                                {/* Individual Scores */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <ESGScoreCard
                                        title="Environmental"
                                        score={company.latestScores.environmental}
                                        subtitle="Climate, Energy, Resources"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ESGScoreCard
                                        title="Social"
                                        score={company.latestScores.social}
                                        subtitle="Labor, Community, Diversity"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ESGScoreCard
                                        title="Governance"
                                        score={company.latestScores.governance}
                                        subtitle="Ethics, Compliance, Leadership"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Charts */}
                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} md={6}>
                                <ESGPieChart data={company.latestScores} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <ESGBarChart data={company.latestScores} />
                            </Grid>
                        </Grid>

                        {/* Greenwashing Risk */}
                        {company.greenwashingRisk && (
                            <Box mb={4}>
                                <GreenwashingRiskIndicator risk={company.greenwashingRisk} />
                            </Box>
                        )}
                    </>
                )}

                {/* Reports History with Trend Visualization */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        📊 Reports History ({reports.length} {reports.length === 1 ? 'report' : 'reports'})
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {reports.length === 0 ? (
                        <Alert severity="info">
                            No reports have been uploaded yet. Upload your first sustainability report to get started!
                        </Alert>
                    ) : (
                        <>
                            {/* Trend Chart - Only show if 2+ completed reports */}
                            {reports.filter(r => r.processingStatus === 'completed').length >= 2 && (
                                <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                        ESG Score Trends Over Time
                                    </Typography>
                                    <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                        <ESGTrendChart reports={reports} />
                                    </Box>
                                </Box>
                            )}

                            {/* Reports List */}
                            <Box>
                                {reports.map((report, index) => (
                                    <ReportCard
                                        key={report._id}
                                        report={report}
                                        isLatest={index === 0}
                                        onDelete={() => fetchCompanyDetails()}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default CompanyDetail;
