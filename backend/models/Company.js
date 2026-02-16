const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    // Latest ESG scores (updated when new report is processed)
    latestScores: {
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
        },
        lastUpdated: {
            type: Date,
            default: null
        }
    },
    // Greenwashing risk
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
        description: {
            type: String,
            default: ''
        }
    },
    // Reference to reports
    reportCount: {
        type: Number,
        default: 0
    },
    // Admin who created this company
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
companySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Company', companySchema);
