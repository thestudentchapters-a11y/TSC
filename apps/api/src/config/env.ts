import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/the-student-chapters',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-only-refresh-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  corsOrigin: (process.env.CORS_ORIGIN ?? process.env.CLIENT_URL ?? 'http://localhost:3000').split(','),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
};

if (env.nodeEnv === 'production' && (env.jwtSecret.includes('change-me') || env.jwtRefreshSecret.includes('change-me'))) {
  // Fail fast in production if secrets were never configured.
  throw new Error('JWT_SECRET / JWT_REFRESH_SECRET must be set to strong random values in production.');
}
