import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const uri =
  import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

export function createApolloClient() {
  return new ApolloClient({
    link: createHttpLink({
      uri,
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'network-only' },
    },
  });
}
