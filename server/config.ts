// server/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Server-side environment variables
export const SERVER_CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  PORT: process.env.PORT || '5001', // Changed from 5000 to 5001 to avoid conflicts
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validate required environment variables
export const validateServerConfig = () => {
  if (!SERVER_CONFIG.OPENAI_API_KEY || SERVER_CONFIG.OPENAI_API_KEY === 'default_key') {
    console.warn('Warning: OPENAI_API_KEY is not set in environment variables. AI features will be disabled.');
  }
  
  if (SERVER_CONFIG.NODE_ENV === 'production' && 
      (!SERVER_CONFIG.OPENAI_API_KEY || SERVER_CONFIG.OPENAI_API_KEY === 'default_key')) {
    throw new Error('OPENAI_API_KEY is required in production environment');
  }
  
  console.log('Server configuration loaded successfully');
  if (SERVER_CONFIG.OPENAI_API_KEY) {
    console.log('OpenAI API key is set');
  }
};