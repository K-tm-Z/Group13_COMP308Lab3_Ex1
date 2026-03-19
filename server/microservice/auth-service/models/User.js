import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, description: "Unique username for each user" },
  email: { type: String, required: true, unique: true, description: "User's email address" },
  password: { type: String, required: true, description: "User's password stored securely (hashed)" },
  role: {
    type: String,
    enum: ['resident', 'business_owner', 'community_organizer'],
    default: 'resident',
    description:
      "Defines user permissions. Allowed values: 'resident', 'business_owner', 'community_organizer'",
  },
  createdAt: { type: Date, default: Date.now, description: "Timestamp for when the user was created" },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model('User', userSchema);