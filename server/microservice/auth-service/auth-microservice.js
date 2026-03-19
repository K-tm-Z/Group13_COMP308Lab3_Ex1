import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import connectDB from './config/mongoose.js';
import { config } from './config/config.js';
import typeDefs from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

await connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();

app.use(
  '/graphql',
  expressMiddleware(apolloServer, {
    context: async ({ req, res }) => ({ req, res }),
  })
);

const httpServer = app.listen(config.port, () => {
  console.log(`Auth service ready at http://localhost:${config.port}/graphql`);
});

const shutdown = async () => {
  await apolloServer.stop();
  httpServer.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
