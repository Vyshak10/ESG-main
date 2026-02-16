import React from 'react';
import { Box, Paper, Typography, LinearProgress, useTheme } from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    Remove,
    Nature,
    Group,
    Gavel,
    Assessment
} from '@mui/icons-material';

const getScoreColor = (score) => {
    if (score >= 70) return '#00C49F'; // Bright Teal
    if (score >= 50) return '#FFBB28'; // Amber
    return '#FF8042'; // Orange/Red
};

const getScoreGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
};

const getTrendIcon = (score) => {
    if (score >= 70) return <TrendingUp sx={{ color: '#00C49F' }} />;
    if (score >= 50) return <Remove sx={{ color: '#FFBB28' }} />;
    return <TrendingDown sx={{ color: '#FF8042' }} />;
};

// Helper to get background icon based on title
const getContextIcon = (title) => {
    const lowerTitle = title ? title.toLowerCase() : '';
    if (lowerTitle.includes('env')) return <Nature sx={{ fontSize: 120, opacity: 0.05 }} />;
    if (lowerTitle.includes('soc')) return <Group sx={{ fontSize: 120, opacity: 0.05 }} />;
    if (lowerTitle.includes('gov')) return <Gavel sx={{ fontSize: 120, opacity: 0.05 }} />;
    return <Assessment sx={{ fontSize: 120, opacity: 0.05 }} />;
};

const ESGScoreCard = ({ title, score, subtitle, showGrade = false }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const color = getScoreColor(score);
    const grade = getScoreGrade(score);

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden', // Keeps the large icon inside
                p: 3,
                borderRadius: '24px',
                background: isDark
                    ? `linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(30,41,59,0.4) 100%)`
                    : `linear-gradient(135deg, #ffffff 0%, #f8faff 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${color}30`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 12px 30px ${color}20`,
                    border: `1px solid ${color}80`,
                }
            }}
        >
            {/* Background Watermark Icon */}
            <Box sx={{ position: 'absolute', right: -20, bottom: -20, transform: 'rotate(-10deg)', zIndex: 0 }}>
                {getContextIcon(title)}
            </Box>

            <Box position="relative" zIndex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1}>
                        {title}
                    </Typography>
                    {getTrendIcon(score)}
                </Box>

                <Box display="flex" alignItems="flex-end" mb={3}>
                    <Typography
                        variant="h2"
                        fontWeight={800}
                        sx={{ color: color, lineHeight: 1 }}
                    >
                        {score}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ ml: 1, mb: 0.5, opacity: 0.6 }}>
                        /100
                    </Typography>

                    {showGrade && (
                        <Box
                            ml={2}
                            px={1.5}
                            py={0.5}
                            borderRadius={2}
                            sx={{
                                backgroundColor: `${color}15`,
                                border: `1px solid ${color}40`,
                                color: color
                            }}
                        >
                            <Typography variant="h6" fontWeight={800}>
                                {grade}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box mb={1}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">Progress</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color }}>{score}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={score || 0}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${color}15`,
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: color,
                                borderRadius: 4,
                                boxShadow: `0 0 10px ${color}80` // Glow effect
                            }
                        }}
                    />
                </Box>

                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, opacity: 0.8, fontWeight: 500 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default ESGScoreCard;