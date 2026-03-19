const typeDefs = `#graphql
  enum PostCategory {
    news
    discussion
  }

  type Post {
    id: ID!
    authorId: ID!
    title: String!
    content: String!
    category: PostCategory!
    aiSummary: String
    createdAt: String!
    updatedAt: String!
  }

  type HelpRequest {
    id: ID!
    authorId: ID!
    description: String!
    location: String
    isResolved: Boolean!
    volunteerIds: [ID!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
    postsByCategory(category: PostCategory!): [Post!]!
    helpRequests: [HelpRequest!]!
    helpRequest(id: ID!): HelpRequest
    openHelpRequests: [HelpRequest!]!
  }

  type Mutation {
    createPost(
      authorId: ID!
      title: String!
      content: String!
      category: PostCategory!
      aiSummary: String
    ): Post!
    updatePost(
      id: ID!
      title: String
      content: String
      category: PostCategory
      aiSummary: String
    ): Post
    deletePost(id: ID!): Boolean!

    createHelpRequest(authorId: ID!, description: String!, location: String): HelpRequest!
    updateHelpRequest(
      id: ID!
      description: String
      location: String
      isResolved: Boolean
    ): HelpRequest
    deleteHelpRequest(id: ID!): Boolean!
    addVolunteer(requestId: ID!, userId: ID!): HelpRequest
    removeVolunteer(requestId: ID!, userId: ID!): HelpRequest
  }
`;

export default typeDefs;
