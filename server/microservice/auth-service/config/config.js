import dotenv from 'dotenv';
dotenv.config();
// Configuration for auth-service
export const config = {
  db: process.env.AUTH_MONGO_URI || 'mongodb://localhost:27017/authServiceDB',  // ✅ Separate DB for auth-service
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',  // ✅ Shared JWT secret
  port: process.env.AUTH_PORT || 4001,  // ✅ Correct port for auth-service
};

if (process.env.NODE_ENV !== 'production') {
  const secretOk = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET !== 'fallback_secret');
  console.log(`🔐 JWT_SECRET: ${secretOk ? 'set from env' : 'using default (set JWT_SECRET in production)'}`);
}