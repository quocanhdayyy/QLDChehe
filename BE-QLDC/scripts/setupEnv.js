const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

// Check if .env exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists!');
  process.exit(0);
}

// Create .env from .env.example if it exists
const examplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(examplePath)) {
  const exampleContent = fs.readFileSync(examplePath, 'utf8');
  fs.writeFileSync(envPath, exampleContent);
  console.log('✅ Created .env from .env.example');
  console.log('⚠️  Please edit .env file and replace placeholder values with your actual credentials!');
  console.log('   - MONGODB_ATLAS: your MongoDB connection string');
  console.log('   - JWT_SECRET: your secret key');
} else {
  // Create basic .env if no example
  const basicEnv = `PORT=3001
MONGODB_ATLAS=mongodb://localhost:27017/qldc
JWT_SECRET=your-secret-key
NODE_ENV=development
`;
  fs.writeFileSync(envPath, basicEnv);
  console.log('✅ Created basic .env file');
  console.log('⚠️  Please edit .env file with your MongoDB credentials!');
}

console.log('📝 .env file created at:', envPath);