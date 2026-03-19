import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: { type: String, required: true },
    location: { type: String },
    isResolved: { type: Boolean, default: false },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('HelpRequest', helpRequestSchema);
