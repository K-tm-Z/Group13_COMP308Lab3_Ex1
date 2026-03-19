import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from '@apollo/gateway';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://studio.apollographql.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('/graphql', cors(corsOptions));

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:4001/graphql' },
      { name: 'products', url: 'http://localhost:4002/graphql' },
    ],
  }),
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context.req?.headers.authorization) {
          request.http.headers.set(
            'authorization',
            context.req.headers.authorization
          );
        }
      },
    });
  },
});

const server = new ApolloServer({
  gateway,
  introspection: true,
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log('🔵 Gateway Authorization:', req.headers.authorization);
        console.log('🔵 Gateway cookies:', req.cookies);
        return { req };
      },
    })
  );

  app.listen(4000, () => {
    console.log('🚀 API Gateway ready at http://localhost:4000/graphql');
  });
}

startServer();