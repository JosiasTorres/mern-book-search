import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configurar el link HTTP
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // ⚠️ Asegúrate de que el backend esté corriendo en este puerto
});

// Configurar el middleware para incluir el token JWT en los headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Crear el cliente de Apollo
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;