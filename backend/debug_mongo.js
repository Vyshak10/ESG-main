require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connection SUCCESS!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection FAILED');
        console.error('Error Name:', err.name);
        console.error('Error Code:', err.code);
        console.error('Error CodeName:', err.codeName);
        console.error('Error Message:', err.message);
        process.exit(1);
    });
