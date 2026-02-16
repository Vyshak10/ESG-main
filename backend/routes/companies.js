const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Report = require('../models/Report');
const { auth, requireAdmin } = require('../middleware/auth');

// @route   GET /api/companies
// @desc    Get all companies with latest scores
// @access  Private (both user and admin)
router.get('/', auth, async (req, res) => {
    try {
        const companies = await Company.find()
            .select('-createdBy')
            .sort({ 'latestScores.lastUpdated': -1 });

        res.json({
            success: true,
            count: companies.length,
            companies
        });

    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/companies/:id
// @desc    Get single company with detailed information
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Get all reports for this company
        const reports = await Report.find({ company: req.params.id })
            .select('-analysisDetails.greenwashingAlerts')
            .sort({ uploadDate: -1 });

        res.json({
            success: true,
            company,
            reports
        });

    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/companies
// @desc    Create a new company
// @access  Private (Admin only)
router.post('/', [auth, requireAdmin], [
    body('name').notEmpty().withMessage('Company name is required'),
    body('description').optional(),
    body('industry').optional(),
    body('website').optional().isURL().withMessage('Invalid website URL')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, description, industry, website, logo } = req.body;

        // Check if company already exists
        let company = await Company.findOne({ name });
        if (company) {
            return res.status(400).json({
                success: false,
                message: 'Company with this name already exists'
            });
        }

        // Create new company
        company = new Company({
            name,
            description,
            industry,
            website,
            logo,
            createdBy: req.user._id
        });

        await company.save();

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            company
        });

    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/companies/:id
// @desc    Update company information
// @access  Private (Admin only)
router.put('/:id', [auth, requireAdmin], async (req, res) => {
    try {
        const { name, description, industry, website, logo } = req.body;

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Update fields
        if (name) company.name = name;
        if (description !== undefined) company.description = description;
        if (industry !== undefined) company.industry = industry;
        if (website !== undefined) company.website = website;
        if (logo !== undefined) company.logo = logo;

        await company.save();

        res.json({
            success: true,
            message: 'Company updated successfully',
            company
        });

    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/companies/:id
// @desc    Delete a company
// @access  Private (Admin only)
router.delete('/:id', [auth, requireAdmin], async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Delete all reports associated with this company
        await Report.deleteMany({ company: req.params.id });

        // Delete company
        await Company.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Company and associated reports deleted successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/companies/cleanup/:name
// @desc    Force delete a company by name (for cleanup of problematic records)
// @access  Private (Admin only)
router.delete('/cleanup/:name', [auth, requireAdmin], async (req, res) => {
    try {
        const companyName = decodeURIComponent(req.params.name);

        console.log(`Attempting to delete company by name: ${companyName}`);

        // Find all companies with this name
        const companies = await Company.find({ name: companyName });

        if (companies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No companies found with that name'
            });
        }

        let deletedCount = 0;
        let reportCount = 0;

        // Delete all matching companies and their reports
        for (const company of companies) {
            // Delete all reports for this company
            const reports = await Report.deleteMany({ company: company._id });
            reportCount += reports.deletedCount || 0;

            // Delete the company
            await Company.findByIdAndDelete(company._id);
            deletedCount++;
        }

        res.json({
            success: true,
            message: `Deleted ${deletedCount} company(ies) and ${reportCount} report(s)`,
            deletedCompanies: deletedCount,
            deletedReports: reportCount
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cleanup',
            error: error.message
        });
    }
});

module.exports = router;
