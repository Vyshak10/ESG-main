import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Box, Typography, Paper, useTheme, Chip } from '@mui/material';
import { VerifiedUser, WarningAmber, GppBad } from '@mui/icons-material';

// --- Modern Vibrant Palette ---
const COLORS = {
    Environmental: '#00C49F', // Bright Teal
    Social: '#0088FE',        // Electric Blue
    Governance: '#FFBB28',    // Golden Amber
    TextLight: '#ffffff',
    TextDark: '#1e293b'
};

// --- Reusable Glass Container ---
const GlassCard = ({ children, sx }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: '24px',
                background: isDark
                    ? 'rgba(30, 41, 59, 0.6)'
                    : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)'}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                ...sx
            }}
        >
            {children}
        </Paper>
    );
};

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                p: 2,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                    {payload[0].name}
                </Typography>
                <Typography variant="h6" color={payload[0].payload.fill} fontWeight={700}>
                    {payload[0].value}
                </Typography>
            </Box>
        );
    }
    return null;
};

export const ESGPieChart = ({ data }) => {
    const chartData = [
        { name: 'Environmental', value: data.environmental, fill: COLORS.Environmental },
        { name: 'Social', value: data.social, fill: COLORS.Social },
        { name: 'Governance', value: data.governance, fill: COLORS.Governance }
    ];

    return (
        <GlassCard sx={{ height: '100%', minHeight: 380, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center" fontWeight={700}>
                ESG Composition
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80} // Donut Style
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={8}
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </GlassCard>
    );
};

export const ESGBarChart = ({ data }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const chartData = [
        { category: 'Environmental', score: data.environmental, fill: COLORS.Environmental },
        { category: 'Social', score: data.social, fill: COLORS.Social },
        { category: 'Governance', score: data.governance, fill: COLORS.Governance }
    ];

    return (
        <GlassCard sx={{ height: '100%', minHeight: 380 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                    Score Comparison
                </Typography>
                <Chip label="2024" size="small" variant="outlined" />
            </Box>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barSize={60}>
                    <defs>
                        {/* Define Gradients for Bars */}
                        {chartData.map((entry, index) => (
                            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1" key={index}>
                                <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                <stop offset="100%" stopColor={entry.fill} stopOpacity={0.4} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e0e0e0'} />
                    <XAxis
                        dataKey="category"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="score" radius={[12, 12, 12, 12]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </GlassCard>
    );
};

export const GreenwashingRiskIndicator = ({ risk }) => {
    const getRiskStyles = (level) => {
        switch (level) {
            case 'Low': return { color: '#00C49F', bg: 'rgba(0, 196, 159, 0.15)', icon: VerifiedUser };
            case 'Medium': return { color: '#FFBB28', bg: 'rgba(255, 187, 40, 0.15)', icon: WarningAmber };
            case 'High': return { color: '#FF8042', bg: 'rgba(255, 128, 66, 0.15)', icon: GppBad };
            default: return { color: '#9e9e9e', bg: '#f5f5f5', icon: WarningAmber };
        }
    };

    const style = getRiskStyles(risk.level);
    const Icon = style.icon;

    return (
        <GlassCard>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.2}>
                        RISK ASSESSMENT
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: style.color }}>
                        {risk.level}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        bgcolor: style.bg,
                        color: style.color,
                        boxShadow: `0 0 20px ${style.bg}`
                    }}
                >
                    <Icon fontSize="large" />
                </Box>
            </Box>

            <Box mt={3} p={2} borderRadius={3} bgcolor={style.bg} border={`1px solid ${style.color}30`}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h3" fontWeight={700} color={style.color}>
                        {risk.score}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 60, lineHeight: 1.1 }}>
                        RISK INDEX
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {risk.description || 'No description available'}
                </Typography>
            </Box>

            {risk.alertCount > 0 && (
                <Box mt={2} display="flex" alignItems="center" gap={1}>
                    <Box width={8} height={8} borderRadius="50%" bgcolor={style.color} sx={{ boxShadow: `0 0 8px ${style.color}` }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                        {risk.alertCount} anomalies detected
                    </Typography>
                </Box>
            )}
        </GlassCard>
    );
};