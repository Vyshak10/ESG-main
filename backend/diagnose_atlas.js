require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('=== MongoDB Atlas Connection Diagnostics ===\n');

// Parse the connection string
try {
    const url = new URL(uri.replace('mongodb+srv://', 'https://'));
    const username = url.username;
    const password = url.password;
    const hostname = url.hostname;

    console.log('✓ Connection string format is valid');
    console.log(`  Username: ${username}`);
    console.log(`  Password length: ${password.length} characters`);
    console.log(`  Password starts with: ${password.substring(0, 3)}...`);
    console.log(`  Hostname: ${hostname}`);
    console.log(`  Database: ${uri.split('/')[3]?.split('?')[0] || 'default'}`);

    // Check for common issues
    console.log('\n=== Checking for common issues ===');

    if (password.includes('<') || password.includes('>')) {
        console.log('❌ ERROR: Password contains < or > characters');
        console.log('   Remove the angle brackets from your password!');
    } else {
        console.log('✓ No angle brackets in password');
    }

    if (password.includes(' ')) {
        console.log('❌ WARNING: Password contains spaces');
    }

    // Special characters that need URL encoding
    const specialChars = ['@', ':', '/', '?', '#', '[', ']'];
    const hasSpecialChars = specialChars.some(char => password.includes(char));
    if (hasSpecialChars) {
        console.log('⚠️  WARNING: Password contains special characters that may need URL encoding');
        console.log('   Try regenerating a simpler password in Atlas');
    }

} catch (e) {
    console.log('❌ ERROR: Invalid connection string format');
    console.log(e.message);
    process.exit(1);
}

console.log('\n=== Attempting connection ===');

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
})
    .then(() => {
        console.log('✅ CONNECTION SUCCESS!');
        console.log('   Your MongoDB Atlas connection is working correctly.');
        process.exit(0);
    })
    .catch(err => {
        console.log('\n❌ CONNECTION FAILED\n');
        console.log('Error details:');
        console.log(`  Name: ${err.name}`);
        console.log(`  Code: ${err.code || 'N/A'}`);
        console.log(`  CodeName: ${err.codeName || 'N/A'}`);
        console.log(`  Message: ${err.message}`);

        console.log('\n=== Troubleshooting Steps ===');

        if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
            console.log('1. Go to MongoDB Atlas → Database Access');
            console.log('2. Click EDIT on your user (bhavyarnair12_db_user)');
            console.log('3. Click "Edit Password"');
            console.log('4. Click "Autogenerate Secure Password" and COPY it');
            console.log('5. Click "Update User"');
            console.log('6. Paste the new password in your .env file');
            console.log('   IMPORTANT: Remove any < > brackets!');
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('network')) {
            console.log('1. Check your internet connection');
            console.log('2. Go to MongoDB Atlas → Network Access');
            console.log('3. Ensure 0.0.0.0/0 is in the IP Access List');
        }

        process.exit(1);
    });
