import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    Button,
    Collapse,
    Grid,
    IconButton,
    Alert
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    CheckCircle,
    Error as ErrorIcon,
    HourglassEmpty
} from '@mui/icons-material';
import { reportsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ESGScoreCard from './ESGScoreCard';

const ReportCard = ({ report, isLatest, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete report "${report.originalName}"? This action cannot be undone.`)) {
            setDeleting(true);
            try {
                await reportsAPI.delete(report._id);
                if (onDelete) onDelete();
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Failed to delete report');
                setDeleting(false);
            }
        }
    };

    const getStatusIcon = () => {
        switch (report.processingStatus) {
            case 'completed':
                return <CheckCircle color="success" />;
            case 'failed':
                return <ErrorIcon color="error" />;
            case 'processing':
                return <HourglassEmpty color="warning" />;
            default:
                return <HourglassEmpty color="disabled" />;
        }
    };

    const getStatusColor = () => {
        switch (report.processingStatus) {
            case 'completed':
                return 'success';
            case 'failed':
                return 'error';
            case 'processing':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'success.main';
        if (score >= 50) return 'warning.main';
        return 'error.main';
    };

    return (
        <Card
            sx={{
                mb: 2,
                border: isLatest ? 2 : 1,
                borderColor: isLatest ? 'primary.main' : 'divider',
                position: 'relative'
            }}
        >
            {isLatest && (
                <Chip
                    label="Latest Report"
                    color="primary"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1
                    }}
                />
            )}

            <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                    <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mt: 0.5 }} />

                    <Box flexGrow={1}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, pr: isLatest ? 12 : 0 }}>
                            {report.originalName}
                        </Typography>

                        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                            <Chip
                                icon={getStatusIcon()}
                                label={report.processingStatus.charAt(0).toUpperCase() + report.processingStatus.slice(1)}
                                size="small"
                                color={getStatusColor()}
                            />
                            <Chip
                                label={new Date(report.uploadDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                size="small"
                                variant="outlined"
                            />
                            {report.processingStatus === 'completed' && (
                                <Chip
                                    label={`Overall Score: ${report.scores.overall}`}
                                    size="small"
                                    sx={{
                                        bgcolor: getScoreColor(report.scores.overall),
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            )}
                        </Box>

                        {report.processingStatus === 'failed' && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                {report.errorMessage || 'Processing failed'}
                            </Alert>
                        )}
                    </Box>
                </Box>
            </CardContent>

            {report.processingStatus === 'completed' && (
                <>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Button
                            onClick={handleExpandClick}
                            endIcon={
                                <ExpandMoreIcon
                                    sx={{
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: '0.3s'
                                    }}
                                />
                            }
                        >
                            {expanded ? 'Hide Details' : 'View Full Analysis'}
                        </Button>

                        {isAdmin && (
                            <IconButton
                                onClick={handleDelete}
                                disabled={deleting}
                                color="error"
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </CardActions>

                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent sx={{ pt: 0, bgcolor: 'background.default' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Detailed ESG Analysis
                            </Typography>

                            {/* ESG Scores Breakdown */}
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} sm={4}>
                                    <ESGScoreCard
                                        title="Environmental"
                                        score={report.scores.environmental}
                                        subtitle="Climate & Resources"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <ESGScoreCard
                                        title="Social"
                                        score={report.scores.social}
                                        subtitle="Labor & Community"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <ESGScoreCard
                                        title="Governance"
                                        score={report.scores.governance}
                                        subtitle="Ethics & Leadership"
                                    />
                                </Grid>
                            </Grid>

                            {/* Greenwashing Risk */}
                            {report.greenwashingRisk && (
                                <Box mb={3}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                        Greenwashing Risk Assessment
                                    </Typography>
                                    <Alert
                                        severity={
                                            report.greenwashingRisk.level === 'High' ? 'error' :
                                                report.greenwashingRisk.level === 'Medium' ? 'warning' : 'success'
                                        }
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Risk Level: {report.greenwashingRisk.level} (Score: {report.greenwashingRisk.score})
                                        </Typography>
                                        <Typography variant="body2">
                                            {report.greenwashingRisk.description}
                                        </Typography>
                                        {report.greenwashingRisk.alertCount > 0 && (
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {report.greenwashingRisk.alertCount} potential greenwashing alerts detected
                                            </Typography>
                                        )}
                                    </Alert>
                                </Box>
                            )}

                            {/* Key Insights */}
                            {report.analysisDetails?.insights && report.analysisDetails.insights.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                        Key Insights
                                    </Typography>
                                    <Box component="ul" sx={{ pl: 2 }}>
                                        {report.analysisDetails.insights.map((insight, idx) => (
                                            <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                                                {insight}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Analysis Stats */}
                            {report.analysisDetails && (
                                <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Analysis Statistics: {report.analysisDetails.totalSegmentsAnalyzed} segments analyzed
                                        {report.analysisDetails.categoryDistribution && (
                                            <> • Environmental: {report.analysisDetails.categoryDistribution.Environmental} •
                                                Social: {report.analysisDetails.categoryDistribution.Social} •
                                                Governance: {report.analysisDetails.categoryDistribution.Governance}</>
                                        )}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Collapse>
                </>
            )}
        </Card>
    );
};

export default ReportCard;
