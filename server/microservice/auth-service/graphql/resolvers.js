import User from '../models/User.js';
import bcrypt from 'bcrypt';
import {config} from '../config/config.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const resolvers = {
    Query: {
        currentUser: (_, __, context) => {
            console.log("🔍 Debugging context:", context);  // ✅ Debugging
            const { req } = context;
        
            if (!req || !req.cookies) {  // ✅ Ensure `req` exists
            console.log("🚨 Request object is missing!");
            return null;
            }
        
            const token = req.cookies.token;
            if (!token) {
            return null;  // No user is logged in
            }
        
            try {
            console.log("🔍 JWT_SECRET in resolvers.js:", config.JWT_SECRET);
            const decoded = jwt.verify(token, config.JWT_SECRET);
            return { username: decoded.username };
            } catch (error) {
            console.error("Error verifying token:", error);
            return null;
            }
        },
        Users: async () => {
            try {
                return await User.find();
            } catch (error) {
                console.error('Error fetching users:', error);
                throw new Error('Failed to fetch users');
            }
        }
    },
    Mutation: {
        login: async (_, { username, password }) => {
            try {
                const user = await User.findOne({ username });
                if (!user) {
                    throw new Error('User not found');
                }
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    throw new Error('Invalid credentials');
                }
                const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
                return { token, user };
            } catch (error) {
                console.error('Error during login:', error);
                throw new Error('Failed to login');
            }
        },
        register: async (_, { username, password, email, role }) => {
            try {
                const existingUser = await
                    User.findOne({ username });
                if (existingUser) {
                    throw new Error('Username already exists');
                }
                if (email == existingUser.email) {
                    throw new Error('Email already exists');
                }
                const newUser = new User({ username, password, email, role });
                await newUser.save();
                return true;
            } catch (error) {
                console.error('Error during registration:', error);
                throw new Error('Failed to register');
            }
        }
    }
};