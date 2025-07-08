import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const api = import.meta.env.VITE_API_URL;

const httpLink = createHttpLink({
  uri: `${api}/graphql`,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
}); 