import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from '@shared/authToken.js';

const uri =
  import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const httpLink = createHttpLink({
  uri,
  credentials: 'include',
});

export function createApolloClient() {
  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'network-only' },
    },
  });
}
