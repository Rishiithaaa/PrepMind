const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const env = {};
lines.forEach(line => {
  const index = line.indexOf('=');
  if (index !== -1) {
    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim();
    env[key] = value;
  }
});

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('Connecting to:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(MONGODB_URI, { dbName: 'ai-mock-interview' })
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB');
    
    // Try to write to a test collection
    const TestSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    await Test.create({ name: 'Connection Test ' + new Date().toISOString() });
    console.log('✅ Successfully wrote to database');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    console.error('Full Error details:', JSON.stringify(err, null, 2));
    process.exit(1);
  });
