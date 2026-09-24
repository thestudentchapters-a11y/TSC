import mongoose from 'mongoose';
import { env } from './env';

/** Connect to MongoDB (local or Atlas). */
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    // eslint-disable-next-line no-console
    console.log(`[tsc-api] MongoDB connected → ${mongoose.connection.name}`);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(`[tsc-api] MongoDB connection error:`, err?.message || err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
