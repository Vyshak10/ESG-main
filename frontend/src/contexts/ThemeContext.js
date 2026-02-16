import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeModeProvider');
    }
    return context;
};

export const ThemeModeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            primary: {
                                main: '#6366f1',
                                light: '#818cf8',
                                dark: '#4f46e5',
                            },
                            secondary: {
                                main: '#ec4899',
                                light: '#f472b6',
                                dark: '#db2777',
                            },
                            background: {
                                default: '#f8f9fa',
                                paper: '#ffffff',
                            },
                            success: {
                                main: '#10b981',
                            },
                            warning: {
                                main: '#f59e0b',
                            },
                            error: {
                                main: '#ef4444',
                            },
                        }
                        : {
                            primary: {
                                main: '#818cf8',
                                light: '#a5b4fc',
                                dark: '#6366f1',
                            },
                            secondary: {
                                main: '#f472b6',
                                light: '#f9a8d4',
                                dark: '#ec4899',
                            },
                            background: {
                                default: '#0f172a',
                                paper: '#1e293b',
                            },
                            success: {
                                main: '#34d399',
                            },
                            warning: {
                                main: '#fbbf24',
                            },
                            error: {
                                main: '#f87171',
                            },
                        }),
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontWeight: 700 },
                    h2: { fontWeight: 700 },
                    h3: { fontWeight: 600 },
                    h4: { fontWeight: 600 },
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'light'
                                    ? '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                                    : '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: mode === 'light'
                                        ? '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        : '0 20px 25px -5px rgb(0 0 0 / 0.4)',
                                },
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 8,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
