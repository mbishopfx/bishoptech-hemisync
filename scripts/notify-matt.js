const phase = process.argv[2] || 'Unknown Phase';
const status = process.argv[3] || 'Completed';
const message = process.argv[4] || '';

console.log(`[Email Mock] To: matt@bishoptech.dev`);
console.log(`[Email Mock] Subject: Hemisync Build Status - ${phase}`);
console.log(`[Email Mock] Body:`);
console.log(`The ${phase} phase has been marked as ${status}.`);
console.log(message);
console.log(`\n-- Automated System Notification`);
