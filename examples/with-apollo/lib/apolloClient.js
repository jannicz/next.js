import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { concatPagination } from '@apollo/client/utilities';
import { useMemo } from 'react';
import React from 'react';
import Head from 'next/head';

/**
 * Modified example, so that the client side can use the apollo client as HOC
 * Enables the use of getDataFromTree, which determines all child queries in the
 * tree and fetches them all
 *
 * Inspired by https://dev.to/imranib/fullstack-nextjs-with-typescript-graphql-2ce0
 */

// On the client, we store the Apollo Client in the following variable.
// This prevents the client from reinitializing between page transitions.
let apolloClient = null;

function createApolloClient(initialState = {}) {
  console.log('Apollo Client - new ApolloClient');

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      // Server URL (must be absolute)
      uri: 'https://nextjs-graphql-with-prisma-simple.vercel.app/api',
      // Additional fetch() options like `credentials` or `headers`
      credentials: 'same-origin'
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination()
          }
        }
      }
    }).restore(initialState)
  });
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 */
export function initializeApollo(initialState = null) {
  console.log('initialState =>', !!initialState);
  // Always create a new client for every server-side request
  // so that data is not shared between users
  if (!process.browser) {
    return createApolloClient(initialState);
  }

  // Reuse client on client-side
  if (!apolloClient) {
    apolloClient = createApolloClient(initialState);
  }

  return apolloClient;
}

/**
 * Creates and provides the apolloContext to a Next.js PageTree.
 * Use it by wrapping your PageComponent via HOC pattern.
 */
export function withApollo(PageComponent, { ssr = true } = {}) {
  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    // const client = apolloClient || initializeApollo(apolloState);
    const client = apolloClient || useApollo(apolloState);

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName = PageComponent.displayName || PageComponent.name || 'Component';

    if (displayName === 'App') {
      console.warn('This withApollo HOC only works with PageComponents');
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  // TODO Refactor getInitialProps to getServerSideProps
  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async ctx => {
      const { AppTree } = ctx;

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initializeApollo());

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server
      // FIXME !process.browser
      if (!process.browser) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import('@apollo/client/react/ssr');
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                }}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error);
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind();
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();
      return {
        ...pageProps,
        apolloState
      };
    }
  }

  return WithApollo;
}

/**
 * Hook for CSR
 */
export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
