const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type LogoutResult {
    success: Boolean!
    message: String
  }

  type Query {
    """Returns the user derived from the JWT (cookie \`token\` or Authorization Bearer)."""
    currentUser: User
    """Debug / DB inspection only — not for production frontend use."""
    users: [User!]!
    """Look up users by id (e.g. volunteer ids on help requests)."""
    usersByIds(ids: [ID!]!): [User!]!
  }

  type Mutation {
    signup(
      username: String!
      password: String!
      email: String!
      role: String
    ): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    """Clears the auth cookie; clients should also discard any stored JWT."""
    logout: LogoutResult!
  }
`;

export default typeDefs;
