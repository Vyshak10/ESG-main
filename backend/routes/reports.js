const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const Company = require('../models/Company');
const { auth, requireAdmin } = require('../middleware/auth');
const esgProcessor = require('../services/esgProcessor');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// @route   POST /api/reports/upload
// @desc    Upload and process a sustainability report
// @access  Private (Admin only)
router.post('/upload', [auth, requireAdmin], upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { companyId } = req.body;

        if (!companyId) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check Python service health
        const serviceHealthy = await esgProcessor.checkServiceHealth();
        if (!serviceHealthy) {
            fs.unlinkSync(req.file.path);
            return res.status(503).json({
                success: false,
                message: 'ESG analysis service is currently unavailable'
            });
        }

        // Process report asynchronously
        const processingPromise = esgProcessor.processReport(
            req.file.path,
            companyId,
            req.user._id,
            req.file.originalname,
            req.file.size
        );

        // Don't wait for processing to complete - return immediately
        res.json({
            success: true,
            message: 'Report uploaded successfully. Processing started.',
            filename: req.file.originalname
        });

        // Process in background
        processingPromise
            .then(result => {
                console.log('Report processing completed:', result.report._id);
                // Clean up file after successful processing
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            })
            .catch(error => {
                console.error('Report processing failed:', error);
                // Clean up file after failed processing
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            });

    } catch (error) {
        console.error('Upload error:', error);

        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Server error during upload'
        });
    }
});

// @route   GET /api/reports/company/:companyId
// @desc    Get all reports for a company
// @access  Private
router.get('/company/:companyId', auth, async (req, res) => {
    try {
        const reports = await Report.find({ company: req.params.companyId })
            .select('-analysisDetails.greenwashingAlerts')
            .sort({ uploadDate: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/reports/:reportId
// @desc    Get detailed report information
// @access  Private
router.get('/:reportId', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .populate('company', 'name industry');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/reports/status/:reportId
// @desc    Check processing status of a report
// @access  Private (Admin only)
router.get('/status/:reportId', [auth, requireAdmin], async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .select('processingStatus errorMessage processedAt scores');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            status: report.processingStatus,
            processedAt: report.processedAt,
            errorMessage: report.errorMessage,
            scores: report.processingStatus === 'completed' ? report.scores : null
        });

    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/reports/:reportId
// @desc    Delete a specific report
// @access  Private (Admin only)
router.delete('/:reportId', [auth, requireAdmin], async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const companyId = report.company;

        // Delete the report
        await Report.findByIdAndDelete(req.params.reportId);

        // Update company's latest scores if this was the latest report
        const remainingReports = await Report.find({ company: companyId })
            .sort({ uploadDate: -1 })
            .limit(1);

        const company = await Company.findById(companyId);
        if (company) {
            if (remainingReports.length > 0) {
                // Update with the latest remaining report
                const latestReport = remainingReports[0];
                company.latestScores = {
                    totalScore: latestReport.scores.totalScore,
                    environmental: latestReport.scores.environmental,
                    social: latestReport.scores.social,
                    governance: latestReport.scores.governance,
                    lastUpdated: latestReport.uploadDate
                };
            } else {
                // No reports left, clear scores
                company.latestScores = {
                    totalScore: 0,
                    environmental: 0,
                    social: 0,
                    governance: 0,
                    lastUpdated: null
                };
            }
            await company.save();
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });

    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
