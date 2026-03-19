import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['news', 'discussion'],
    },
    aiSummary: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
