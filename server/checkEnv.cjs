// Simple script to check environment variables
require('dotenv').config({ path: './.env' });

console.log('Checking environment variables...');

console.log('VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('VITE_FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? 'SET' : 'NOT SET');

if (process.env.VITE_OPENAI_API_KEY) {
  console.log('VITE_OPENAI_API_KEY length:', process.env.VITE_OPENAI_API_KEY.length);
}

if (process.env.OPENAI_API_KEY) {
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY.length);
}

console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');