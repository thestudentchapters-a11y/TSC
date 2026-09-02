import mongoose from 'mongoose';
import { env } from './env';

/** Connect to MongoDB (local or Atlas). */
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log(`[tsc-api] MongoDB connected → ${mongoose.connection.name}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
