import mongoose from 'mongoose';
import Post from '../models/Post.js';
import HelpRequest from '../models/HelpRequest.js';

function assertObjectId(id, label) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }
}

function postToGraphQL(doc) {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id: String(p._id),
    authorId: String(p.author),
    title: p.title,
    content: p.content,
    category: p.category,
    aiSummary: p.aiSummary ?? null,
    createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
    updatedAt: (p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt)).toISOString(),
  };
}

function helpRequestToGraphQL(doc) {
  if (!doc) return null;
  const h = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id: String(h._id),
    authorId: String(h.author),
    description: h.description,
    location: h.location ?? null,
    isResolved: Boolean(h.isResolved),
    volunteerIds: (h.volunteers || []).map((v) => String(v)),
    createdAt: (h.createdAt instanceof Date ? h.createdAt : new Date(h.createdAt)).toISOString(),
    updatedAt: (h.updatedAt instanceof Date ? h.updatedAt : new Date(h.updatedAt)).toISOString(),
  };
}

export const resolvers = {
  Query: {
    posts: async () => {
      const docs = await Post.find().sort({ createdAt: -1 }).lean();
      return docs.map(postToGraphQL);
    },
    post: async (_, { id }) => {
      assertObjectId(id, 'post id');
      const doc = await Post.findById(id).lean();
      return postToGraphQL(doc);
    },
    postsByCategory: async (_, { category }) => {
      const docs = await Post.find({ category }).sort({ createdAt: -1 }).lean();
      return docs.map(postToGraphQL);
    },
    helpRequests: async () => {
      const docs = await HelpRequest.find().sort({ createdAt: -1 }).lean();
      return docs.map(helpRequestToGraphQL);
    },
    helpRequest: async (_, { id }) => {
      assertObjectId(id, 'help request id');
      const doc = await HelpRequest.findById(id).lean();
      return helpRequestToGraphQL(doc);
    },
    openHelpRequests: async () => {
      const docs = await HelpRequest.find({ isResolved: false }).sort({ createdAt: -1 }).lean();
      return docs.map(helpRequestToGraphQL);
    },
  },

  Mutation: {
    createPost: async (_, { authorId, title, content, category, aiSummary }) => {
      assertObjectId(authorId, 'authorId');
      const doc = await Post.create({
        author: authorId,
        title,
        content,
        category,
        ...(aiSummary != null && aiSummary !== '' ? { aiSummary } : {}),
      });
      return postToGraphQL(doc);
    },

    updatePost: async (_, { id, title, content, category, aiSummary }) => {
      assertObjectId(id, 'post id');
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (category !== undefined) updates.category = category;
      if (aiSummary !== undefined) updates.aiSummary = aiSummary;
      if (Object.keys(updates).length === 0) {
        const existing = await Post.findById(id).lean();
        if (!existing) throw new Error('Post not found');
        return postToGraphQL(existing);
      }
      const doc = await Post.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
      if (!doc) throw new Error('Post not found');
      return postToGraphQL(doc);
    },

    deletePost: async (_, { id }) => {
      assertObjectId(id, 'post id');
      const result = await Post.findByIdAndDelete(id);
      return Boolean(result);
    },

    createHelpRequest: async (_, { authorId, description, location }) => {
      assertObjectId(authorId, 'authorId');
      const doc = await HelpRequest.create({
        author: authorId,
        description,
        ...(location != null && location !== '' ? { location } : {}),
      });
      return helpRequestToGraphQL(doc);
    },

    updateHelpRequest: async (_, { id, description, location, isResolved }) => {
      assertObjectId(id, 'help request id');
      const updates = {};
      if (description !== undefined) updates.description = description;
      if (location !== undefined) updates.location = location;
      if (isResolved !== undefined) updates.isResolved = isResolved;
      if (Object.keys(updates).length === 0) {
        const existing = await HelpRequest.findById(id).lean();
        if (!existing) throw new Error('Help request not found');
        return helpRequestToGraphQL(existing);
      }
      const doc = await HelpRequest.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).lean();
      if (!doc) throw new Error('Help request not found');
      return helpRequestToGraphQL(doc);
    },

    deleteHelpRequest: async (_, { id }) => {
      assertObjectId(id, 'help request id');
      const result = await HelpRequest.findByIdAndDelete(id);
      return Boolean(result);
    },

    addVolunteer: async (_, { requestId, userId }) => {
      assertObjectId(requestId, 'requestId');
      assertObjectId(userId, 'userId');
      const doc = await HelpRequest.findByIdAndUpdate(
        requestId,
        { $addToSet: { volunteers: userId } },
        { new: true, runValidators: true }
      ).lean();
      if (!doc) throw new Error('Help request not found');
      return helpRequestToGraphQL(doc);
    },

    removeVolunteer: async (_, { requestId, userId }) => {
      assertObjectId(requestId, 'requestId');
      assertObjectId(userId, 'userId');
      const doc = await HelpRequest.findByIdAndUpdate(
        requestId,
        { $pull: { volunteers: userId } },
        { new: true }
      ).lean();
      if (!doc) throw new Error('Help request not found');
      return helpRequestToGraphQL(doc);
    },
  },
};
