import App from '../components/App'
import Header from '../components/Header'

const AboutPage = () => (
  <App>
    <Header />
    <article>
      <h1>The Idea Behind This Example</h1>
      <p>
        <a href="https://www.apollographql.com/client/">Apollo</a> is a GraphQL
        client that allows you to easily query the exact data you need from a
        GraphQL server. In addition to fetching and mutating data, Apollo
        analyzes your queries and their results to construct a client-side cache
        of your data, which is kept up to date as further queries and mutations
        are run, fetching more results from the server.
      </p>
      <p>
        In this example, we integrate Apollo Client by wrapping each page containing
        a GraphQL query in its subtree with a <a href="https://reactjs.org/docs/higher-order-components.html">HOC </a>
        called withApollo. This internally calls{' '}
        <a href="https://www.apollographql.com/docs/react/performance/server-side-rendering/#using-getdatafromtree">
          getDataFromTree
        </a>{' '} on server side.
        On the client the behaviour remains unchanged to the default example (reference).
      </p>
      <p>
        This example relies on <a href="http://graph.cool">graph.cool</a> for
        its GraphQL backend.
      </p>
    </article>
  </App>
)

export default AboutPage
