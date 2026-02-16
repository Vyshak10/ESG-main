const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Company = require('../models/Company');
const Report = require('../models/Report');

class ESGProcessorService {
    constructor() {
        this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    }

    /**
     * Process a PDF report using the Python FastAPI service
     * @param {string} filePath - Path to the PDF file
     * @param {string} companyId - MongoDB company ID
     * @param {string} userId - User ID who uploaded the report
     * @param {string} originalName - Original filename
     * @param {number} fileSize - File size in bytes
     * @returns {Promise<Object>} - Processing result
     */
    async processReport(filePath, companyId, userId, originalName, fileSize) {
        try {
            // Get company details
            const company = await Company.findById(companyId);
            if (!company) {
                throw new Error('Company not found');
            }

            // Create report record in database
            const report = new Report({
                company: companyId,
                fileName: filePath,
                originalName,
                fileSize,
                processingStatus: 'processing',
                uploadedBy: userId
            });

            await report.save();

            console.log(`Processing report ${report._id} for company ${company.name}`);

            try {
                // Send PDF to Python service for analysis
                const formData = new FormData();
                formData.append('file', fs.createReadStream(filePath));
                formData.append('company_name', company.name);

                const response = await axios.post(
                    `${this.pythonServiceUrl}/analyze`,
                    formData,
                    {
                        headers: formData.getHeaders(),
                        timeout: 120000 // 2 minute timeout
                    }
                );

                const analysisResult = response.data;

                // Update report with analysis results
                report.processingStatus = 'completed';
                report.processedAt = new Date();

                // Extract scores
                report.scores = {
                    overall: analysisResult.scores.total_esg_score,
                    environmental: analysisResult.scores.dimension_scores.Environmental,
                    social: analysisResult.scores.dimension_scores.Social,
                    governance: analysisResult.scores.dimension_scores.Governance
                };

                // Extract greenwashing risk
                report.greenwashingRisk = {
                    level: analysisResult.greenwashing_risk.level,
                    score: analysisResult.greenwashing_risk.score,
                    alertCount: analysisResult.greenwashing_risk.alert_count || 0,
                    description: analysisResult.greenwashing_risk.description
                };

                // Store analysis details
                report.analysisDetails = {
                    totalSegmentsAnalyzed: analysisResult.total_segments_analyzed,
                    categoryDistribution: analysisResult.category_distribution,
                    insights: analysisResult.insights || [],
                    greenwashingAlerts: analysisResult.greenwashing_alerts || []
                };

                await report.save();

                // Update company's latest scores
                company.latestScores = {
                    overall: report.scores.overall,
                    environmental: report.scores.environmental,
                    social: report.scores.social,
                    governance: report.scores.governance,
                    lastUpdated: new Date()
                };

                company.greenwashingRisk = report.greenwashingRisk;
                company.reportCount += 1;

                await company.save();

                console.log(`Successfully processed report ${report._id}`);

                return {
                    success: true,
                    report,
                    company
                };

            } catch (analysisError) {
                // Update report status to failed
                report.processingStatus = 'failed';
                report.errorMessage = analysisError.message || 'Analysis failed';
                await report.save();

                throw analysisError;
            }

        } catch (error) {
            console.error('Error processing report:', error);
            throw error;
        }
    }

    /**
     * Check if Python service is available
     * @returns {Promise<boolean>}
     */
    async checkServiceHealth() {
        try {
            const response = await axios.get(`${this.pythonServiceUrl}/health`, {
                timeout: 5000
            });
            return response.data.status === 'healthy';
        } catch (error) {
            console.error('Python service health check failed:', error.message);
            return false;
        }
    }
}

module.exports = new ESGProcessorService();
