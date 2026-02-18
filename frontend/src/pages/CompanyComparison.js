import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    useMediaQuery,
    useTheme,
    Fade,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    ArrowBack,
    Nature,
    Groups,
    Gavel,
    TrendingUp,
    TrendingDown,
    Remove,
    DarkMode,
    LightMode,
    BarChart as BarChartIcon,
    TableChart
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useThemeMode } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';

const CompanyComparison = () => {
    const navigate = useNavigate();
    const { mode, toggleTheme } = useThemeMode();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderBy, setOrderBy] = useState('overall');
    const [order, setOrder] = useState('desc');
    const [viewMode, setViewMode] = useState('charts');

    const handleBack = () => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await companiesAPI.getAll();
            const validCompanies = (response.data.companies || [])
                .filter(c => c && c._id && c.latestScores?.overall);
            setCompanies(validCompanies);
        } catch (err) {
            setError('Failed to load companies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
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
        if (score >= 70) return <TrendingUp sx={{ fontSize: 16 }} />;
        if (score >= 50) return <Remove sx={{ fontSize: 16 }} />;
        return <TrendingDown sx={{ fontSize: 16 }} />;
    };

    const sortedCompanies = [...companies].sort((a, b) => {
        let aValue, bValue;

        switch (orderBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'industry':
                aValue = (a.industry || '').toLowerCase();
                bValue = (b.industry || '').toLowerCase();
                break;
            case 'overall':
                aValue = a.latestScores?.overall || 0;
                bValue = b.latestScores?.overall || 0;
                break;
            case 'environmental':
                aValue = a.latestScores?.environmental || 0;
                bValue = b.latestScores?.environmental || 0;
                break;
            case 'social':
                aValue = a.latestScores?.social || 0;
                bValue = b.latestScores?.social || 0;
                break;
            case 'governance':
                aValue = a.latestScores?.governance || 0;
                bValue = b.latestScores?.governance || 0;
                break;
            default:
                return 0;
        }

        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
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
                    <IconButton
                        edge="start"
                        onClick={handleBack}
                        sx={{ mr: 2, color: 'text.primary' }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary' }}>
                        Company Comparison
                    </Typography>
                    <IconButton
                        onClick={toggleTheme}
                        sx={{ color: 'text.primary' }}
                    >
                        {mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Fade in timeout={500}>
                    <Box mb={4}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                                    ESG Score Comparison
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Compare ESG performance across all companies
                                </Typography>
                            </Box>
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            >
                                <ToggleButton value="charts" sx={{ px: 3 }}>
                                    <BarChartIcon sx={{ mr: 1 }} />
                                    Charts
                                </ToggleButton>
                                <ToggleButton value="table" sx={{ px: 3 }}>
                                    <TableChart sx={{ mr: 1 }} />
                                    Table
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>
                </Fade>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {companies.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                        No companies with ESG scores available for comparison.
                    </Alert>
                ) : viewMode === 'charts' ? (
                    /* Charts View */
                    <Grid container spacing={3}>
                        {/* Bar Chart - Overall Comparison */}
                        <Grid item xs={12}>
                            <Fade in timeout={700}>
                                <Card sx={{ borderRadius: 3, p: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                                        Overall ESG Score Comparison
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={sortedCompanies.map(c => ({
                                            name: c.name,
                                            'Overall ESG': c.latestScores.overall,
                                            Environmental: c.latestScores.environmental,
                                            Social: c.latestScores.social,
                                            Governance: c.latestScores.governance
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#444' : '#ddd'} />
                                            <XAxis
                                                dataKey="name"
                                                stroke={mode === 'dark' ? '#fff' : '#000'}
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                            />
                                            <YAxis stroke={mode === 'dark' ? '#fff' : '#000'} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: mode === 'dark' ? '#1e293b' : '#fff',
                                                    border: `1px solid ${mode === 'dark' ? '#444' : '#ddd'}`,
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="Overall ESG" fill="#667eea" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="Environmental" fill="#10b981" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="Social" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="Governance" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Fade>
                        </Grid>

                    </Grid>
                ) : isMobile ? (
                    /* Mobile Card View */
                    <Grid container spacing={3}>
                        {sortedCompanies.map((company, index) => (
                            <Grid item xs={12} key={company._id}>
                                <Fade in timeout={300 + index * 100}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 4
                                            }
                                        }}
                                    >
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                        {company.name}
                                                    </Typography>
                                                    {company.industry && (
                                                        <Chip
                                                            label={company.industry}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                                <Box
                                                    sx={{
                                                        background: getScoreGradient(company.latestScores.overall),
                                                        color: 'white',
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5
                                                    }}
                                                >
                                                    {getScoreIcon(company.latestScores.overall)}
                                                    {company.latestScores.overall}
                                                </Box>
                                            </Box>

                                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                                <Grid item xs={4}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            textAlign: 'center',
                                                            bgcolor: 'success.main',
                                                            color: 'white',
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        <Nature sx={{ fontSize: 20, mb: 0.5 }} />
                                                        <Typography variant="caption" display="block">
                                                            Environmental
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        <Groups sx={{ fontSize: 20, mb: 0.5 }} />
                                                        <Typography variant="caption" display="block">
                                                            Social
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        <Gavel sx={{ fontSize: 20, mb: 0.5 }} />
                                                        <Typography variant="caption" display="block">
                                                            Governance
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                            {company.latestScores.governance}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>

                                            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Last updated: {new Date(company.latestScores.lastUpdated).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    /* Desktop Table View */
                    <Fade in timeout={700}>
                        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'name'}
                                                direction={orderBy === 'name' ? order : 'asc'}
                                                onClick={() => handleSort('name')}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    Company
                                                </Typography>
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'industry'}
                                                direction={orderBy === 'industry' ? order : 'asc'}
                                                onClick={() => handleSort('industry')}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    Industry
                                                </Typography>
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center">
                                            <TableSortLabel
                                                active={orderBy === 'overall'}
                                                direction={orderBy === 'overall' ? order : 'asc'}
                                                onClick={() => handleSort('overall')}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    Overall ESG
                                                </Typography>
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center">
                                            <TableSortLabel
                                                active={orderBy === 'environmental'}
                                                direction={orderBy === 'environmental' ? order : 'asc'}
                                                onClick={() => handleSort('environmental')}
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                                    <Nature sx={{ fontSize: 18 }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        Environmental
                                                    </Typography>
                                                </Box>
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center">
                                            <TableSortLabel
                                                active={orderBy === 'social'}
                                                direction={orderBy === 'social' ? order : 'asc'}
                                                onClick={() => handleSort('social')}
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                                    <Groups sx={{ fontSize: 18 }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        Social
                                                    </Typography>
                                                </Box>
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center">
                                            <TableSortLabel
                                                active={orderBy === 'governance'}
                                                direction={orderBy === 'governance' ? order : 'asc'}
                                                onClick={() => handleSort('governance')}
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                                    <Gavel sx={{ fontSize: 18 }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        Governance
                                                    </Typography>
                                                </Box>
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                Last Updated
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedCompanies.map((company) => (
                                        <TableRow
                                            key={company._id}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                                    cursor: 'pointer'
                                                }
                                            }}
                                            onClick={() => navigate(`/company/${company._id}`)}
                                        >
                                            <TableCell>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {company.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {company.industry && (
                                                    <Chip
                                                        label={company.industry}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box
                                                    sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        background: getScoreGradient(company.latestScores.overall),
                                                        color: 'white',
                                                        px: 2,
                                                        py: 0.5,
                                                        borderRadius: 2,
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {getScoreIcon(company.latestScores.overall)}
                                                    {company.latestScores.overall}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={company.latestScores.environmental}
                                                    color="success"
                                                    sx={{ fontWeight: 600, minWidth: 50 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={company.latestScores.social}
                                                    color="primary"
                                                    sx={{ fontWeight: 600, minWidth: 50 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={company.latestScores.governance}
                                                    color="warning"
                                                    sx={{ fontWeight: 600, minWidth: 50 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(company.latestScores.lastUpdated).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Fade>
                )}
            </Container>
        </Box>
    );
};

export default CompanyComparison;
