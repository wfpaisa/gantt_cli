import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import Vue from 'vue';
import VueApollo from 'vue-apollo';
import App from './App.vue';

Vue.use(VueApollo);


// HTTP connexion to the API
const httpLink = new HttpLink({
  uri: 'http://localhost:1337/graphql',
});

// Cache implementation
const cache = new InMemoryCache();

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

new Vue({
  apolloProvider,
  render: h => h(App),
}).$mount('#app');
