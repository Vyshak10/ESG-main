const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    // ESG Scores from analysis
    scores: {
        overall: {
            type: Number,
            default: 0
        },
        environmental: {
            type: Number,
            default: 0
        },
        social: {
            type: Number,
            default: 0
        },
        governance: {
            type: Number,
            default: 0
        }
    },
    // Greenwashing analysis
    greenwashingRisk: {
        level: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Low'
        },
        score: {
            type: Number,
            default: 0
        },
        alertCount: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: ''
        }
    },
    // Analysis details
    analysisDetails: {
        totalSegmentsAnalyzed: {
            type: Number,
            default: 0
        },
        categoryDistribution: {
            Environmental: { type: Number, default: 0 },
            Social: { type: Number, default: 0 },
            Governance: { type: Number, default: 0 }
        },
        insights: [{
            type: String
        }],
        greenwashingAlerts: [{
            page: Number,
            category: String,
            text: String,
            riskLevel: String,
            reason: String
        }]
    },
    // Error information if processing failed
    errorMessage: {
        type: String,
        default: ''
    },
    processedAt: {
        type: Date,
        default: null
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Index for faster queries
reportSchema.index({ company: 1, uploadDate: -1 });

module.exports = mongoose.model('Report', reportSchema);
