import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

// Colors matching the reference screenshot
const COLORS = {
    Environmental: '#c47399ff', // Green
    Social: '#c472aeff',        // Blue-Purple
    Governance: '#9368b0ff'     // Orange
};

const GRADIENT_COLORS = {
    Environmental: ['#c47399ff', '#873d7bff'],
    Social: ['#c472aeff', '#661b6fff'],
    Governance: ['#9368b0ff', '#320f55ff']
};

export const ESGPieChart = ({ data }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const chartData = [
        { name: 'Environmental', value: data.environmental },
        { name: 'Social', value: data.social },
        { name: 'Governance', value: data.governance }
    ];

    return (
        <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom align="center" fontWeight={600}>
                ESG Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        stroke={isDark ? '#1e293b' : '#fff'}
                        strokeWidth={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                            borderRadius: 8
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export const ESGBarChart = ({ data }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const chartData = [
        { category: 'Environmental', score: data.environmental },
        { category: 'Social', score: data.social },
        { category: 'Governance', score: data.governance }
    ];

    return (
        <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom align="center" fontWeight={600}>
                ESG Scores Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#334155' : '#e5e7eb'}
                    />
                    <XAxis
                        dataKey="category"
                        stroke={isDark ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke={isDark ? '#94a3b8' : '#64748b'}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                            borderRadius: 8
                        }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export const GreenwashingRiskIndicator = ({ risk }) => {
    const getRiskColor = (level) => {
        switch (level) {
            case 'Low': return '#c47399ff';   // Green
            case 'Medium': return '#c472aeff'; // Orange
            case 'High': return '#9368b0ff';   // Red
            default: return '#9e9e9e';
        }
    };

    const color = getRiskColor(risk.level);

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `2px solid ${color}30`,
                borderRadius: 3
            }}
        >
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Greenwashing Risk Assessment
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
                <Box
                    sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        boxShadow: `0 4px 14px ${color}40`
                    }}
                >
                    <Typography variant="h4" color="white" fontWeight={700}>
                        {risk.score}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight={600} sx={{ color }}>
                        {risk.level} Risk
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {risk.description || 'No description available'}
                    </Typography>
                </Box>
            </Box>

            {risk.alertCount > 0 && (
                <Box
                    sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        📊 {risk.alertCount} potential greenwashing instance{risk.alertCount !== 1 ? 's' : ''} detected
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};
