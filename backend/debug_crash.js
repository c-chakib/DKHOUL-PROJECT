const path = require('path');
const fs = require('fs');

console.log('--- STARTING DEBUG CHECK V2 ---');

try {
    console.log('1. Loading utils/bookingUtils...');
    const utils = require('./src/utils/bookingUtils');
    console.log('Utils keys:', Object.keys(utils));
} catch (error) {
    console.error('❌ bookingUtils FAILED:', error);
}

try {
    console.log('2. Loading app.js...');
    const app = require('./src/app');
    console.log('✅ app.js loaded.');
} catch (error) {
    console.error('❌ app.js FAILED:', error);
}

console.log('--- CHECK V2 COMPLETE ---');
