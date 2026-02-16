import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const ESGTrendChart = ({ reports }) => {
    const theme = useTheme();

    // Prepare data for chart (sort by date, oldest first)
    const chartData = reports
        .filter(r => r.processingStatus === 'completed')
        .sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate))
        .map(report => ({
            date: new Date(report.uploadDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            }),
            Overall: report.scores.overall,
            Environmental: report.scores.environmental,
            Social: report.scores.social,
            Governance: report.scores.governance,
        }));

    if (chartData.length < 2) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '0.875rem' }}
                />
                <YAxis
                    domain={[0, 100]}
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '0.875rem' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px'
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="Overall"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                />
                <Line
                    type="monotone"
                    dataKey="Environmental"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="Social"
                    stroke={theme.palette.info.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="Governance"
                    stroke={theme.palette.warning.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ESGTrendChart;
