import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    Alert,
    CircularProgress,
    LinearProgress,
    Chip
} from '@mui/material';
import { ArrowBack, CloudUpload, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { companiesAPI, reportsAPI } from '../services/api';

const AdminUpload = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCompany();
    }, [companyId]);

    const fetchCompany = async () => {
        try {
            const response = await companiesAPI.getById(companyId);
            setCompany(response.data.company);
        } catch (err) {
            setError('Failed to load company details');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please select a PDF file');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setUploadStatus('Uploading file...');
        setError('');

        console.log('Starting upload for company:', companyId);
        console.log('File:', selectedFile.name, 'Size:', selectedFile.size);

        try {
            const response = await reportsAPI.upload(companyId, selectedFile);
            console.log('Upload response:', response);

            setUploadStatus('Processing report with AI...');
            setSuccess(true);

            // Wait a bit then redirect
            setTimeout(() => {
                navigate(`/company/${companyId}`);
            }, 3000);

        } catch (err) {
            console.error('Upload error:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.response?.data?.message);

            const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
            setError(errorMessage);
            setUploading(false);
            setUploadStatus('');
        }
    };

    if (!company) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    <Button
                        onClick={() => navigate('/admin/dashboard')}
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.primary' }}
                    >
                        Back to Dashboard
                    </Button>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2, color: 'text.primary' }}>
                        Upload Report - {company.name}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box textAlign="center" mb={4}>
                        <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                            Upload Sustainability Report
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Upload a PDF sustainability report for {company.name}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success ? (
                        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                            Report uploaded successfully! Processing with AI... You will be redirected to the company dashboard.
                        </Alert>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: selectedFile ? 'primary.main' : 'grey.400',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    mb: 3,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />

                                {selectedFile ? (
                                    <>
                                        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            {selectedFile.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </Typography>
                                        <Button variant="outlined" sx={{ mt: 2 }}>
                                            Change File
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Click to select PDF file
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Maximum file size: 50MB
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            {uploading && (
                                <Box mb={3}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {uploadStatus}
                                    </Typography>
                                    <LinearProgress />
                                </Box>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                startIcon={<CloudUpload />}
                            >
                                {uploading ? 'Processing...' : 'Upload and Analyze'}
                            </Button>

                            <Alert severity="info" sx={{ mt: 3 }}>
                                <Typography variant="body2">
                                    <strong>What happens next:</strong>
                                    <br />
                                    1. Your PDF will be uploaded to our secure server
                                    <br />
                                    2. Our AI will analyze the report and extract ESG metrics
                                    <br />
                                    3. Greenwashing detection will be performed
                                    <br />
                                    4. ESG scores will be calculated and saved
                                    <br />
                                    <br />
                                    This process typically takes 30-60 seconds.
                                </Typography>
                            </Alert>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default AdminUpload;
