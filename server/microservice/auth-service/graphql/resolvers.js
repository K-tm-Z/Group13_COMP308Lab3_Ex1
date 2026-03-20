import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const COOKIE_NAME = 'token';
const TOKEN_EXPIRES = '1h';

function getTokenFromRequest(req) {
  const header = req?.headers?.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return req?.cookies?.[COOKIE_NAME] || null;
}

function userToGraphQL(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  return {
    id: String(u._id),
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
  };
}

function setAuthCookie(res, token) {
  if (!res?.cookie) return;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  if (!res?.clearCookie) return;
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export const resolvers = {
  Query: {
    currentUser: async (_, __, context) => {
      const { req } = context;
      const token = getTokenFromRequest(req);
      if (!token) return null;

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const userId = decoded.userId;
        if (!userId) return null;
        const user = await User.findById(userId);
        return userToGraphQL(user);
      } catch {
        return null;
      }
    },

    users: async () => {
      const docs = await User.find().sort({ createdAt: -1 }).lean();
      return docs.map((u) => userToGraphQL(u));
    },

    usersByIds: async (_, { ids }) => {
      const valid = (ids ?? []).filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (!valid.length) return [];
      const docs = await User.find({ _id: { $in: valid } }).lean();
      return docs.map((u) => userToGraphQL(u));
    },
  },
  Mutation: {
    signup: async (_, { username, password, email, role }, context) => {
      const { res } = context;
      const existing = await User.findOne({
        $or: [{ username }, { email: email.toLowerCase() }],
      });
      if (existing) {
        if (existing.username === username) {
          throw new Error('Username already exists');
        }
        throw new Error('Email already exists');
      }

      const newUser = new User({
        username,
        password,
        email: email.toLowerCase(),
        ...(role != null && role !== '' ? { role } : {}),
      });
      await newUser.save();

      const token = jwt.sign(
        { userId: String(newUser._id), username: newUser.username },
        config.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES }
      );
      setAuthCookie(res, token);

      return {
        token,
        user: userToGraphQL(newUser),
      };
    },

    login: async (_, { username, password }, context) => {
      const { res } = context;
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { userId: String(user._id), username: user.username },
        config.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES }
      );
      setAuthCookie(res, token);

      return {
        token,
        user: userToGraphQL(user),
      };
    },

    logout: async (_, __, context) => {
      const { res } = context;
      clearAuthCookie(res);
      return { success: true, message: 'Logged out' };
    },
  },
};
