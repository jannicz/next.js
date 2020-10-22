import { withApollo } from '../lib/apolloClient';
import App from '../components/App'
import InfoBox from '../components/InfoBox'
import Header from '../components/Header'
import Submit from '../components/Submit'
import PostList, {
  ALL_POSTS_QUERY,
  allPostsQueryVars,
} from '../components/PostList'
import { initializeApollo } from '../lib/apolloClient'

const IndexPage = () => (
  <App>
    <Header />
    <InfoBox>ℹ️ This page shows how to use SSG with Apollo.</InfoBox>
    <Submit />
    <PostList />
  </App>
)

// Apply withApollo HOC for all pages where you want to fetch GraphQL
// This will recursively search the tree for queries and fetch them all
export default withApollo(IndexPage);
