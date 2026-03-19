// GraphQL type definitions
const typeDefs = `#graphql
  type User {
    username: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type Query {
    Users: [User]
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    register(username: String!, password: String!): Boolean
  }

`;

// Export as an ES Module
export default typeDefs;
