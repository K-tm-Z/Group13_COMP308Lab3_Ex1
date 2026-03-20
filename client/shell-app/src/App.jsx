import { lazy, Suspense, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const AuthApp = lazy(() => import('authApp/App'));
const EngageApp = lazy(() => import('engageApp/App'));

const ME_QUERY = gql`
  query ShellCurrentUser {
    currentUser {
      id
      username
      email
    }
  }
`;

function Home() {
  return (
    <div className="p-4">
      <h1>Community platform</h1>
      <p className="text-muted">
        This shell loads two micro frontends via Vite Module Federation:{' '}
        <strong>Authentication</strong> and <strong>Community engagement</strong>.
      </p>
      <p>
        Start the API gateway and subgraphs, then use the navigation links above.
      </p>
      <ul>
        <li>Gateway: <code>http://localhost:4000/graphql</code></li>
        <li>Auth remote dev: port <code>3001</code></li>
        <li>Engage remote dev: port <code>3002</code></li>
      </ul>
    </div>
  );
}

export default function App() {
  const { data, loading, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const onAuthChanged = () => {
      refetch();
    };
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, [refetch]);

  const user = data?.currentUser;

  return (
    <BrowserRouter>
      <div className="App min-vh-100 bg-light">
        <nav className="navbar navbar-expand navbar-dark bg-primary">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">Shell</span>
            <ul className="navbar-nav gap-2">
              <li className="nav-item">
                <NavLink to="/" className="nav-link" end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/auth" className="nav-link">
                  Authentication
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/community" className="nav-link">
                  Community
                </NavLink>
              </li>
            </ul>
            <div className="navbar-text text-white small ms-auto">
              {loading
                ? '…'
                : user
                  ? `Signed in: ${user.username}`
                  : 'Not signed in'}
            </div>
          </div>
        </nav>

        <main className="container py-3 bg-white shadow-sm rounded-3 my-3">
          <Suspense
            fallback={
              <div className="p-4 text-muted">
                Loading micro frontend… (ensure remotes are running on 3001 &
                3002)
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthApp />} />
              <Route path="/community" element={<EngageApp />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
