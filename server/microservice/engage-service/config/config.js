import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: process.env.ENGAGE_MONGO_URI || 'mongodb://localhost:27017/engageServiceDB',
  port: Number(process.env.ENGAGE_PORT) || 4002,
  /** Same secret as auth-service when verifying optional JWT in context. */
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
};

if (process.env.NODE_ENV !== 'production') {
  const secretOk = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET !== 'fallback_secret');
  console.log(`🔐 engage-service JWT_SECRET: ${secretOk ? 'set from env' : 'using default (set JWT_SECRET in production)'}`);
}
