import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { clearAuthToken, setAuthToken } from '@shared/authToken.js';

const ME_QUERY = gql`
  query AuthCurrentUser {
    currentUser {
      id
      username
      email
      role
      createdAt
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation AuthLogin($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation AuthSignup(
    $username: String!
    $password: String!
    $email: String!
    $role: String
  ) {
    signup(
      username: $username
      password: $password
      email: $email
      role: $role
    ) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation AuthLogout {
    logout {
      success
      message
    }
  }
`;

function emitAuthChanged() {
  window.dispatchEvent(new CustomEvent('auth-changed'));
}

export default function App() {
  const { data: meData, loading: meLoading, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('resident');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const token = data?.login?.token;
      if (token) setAuthToken(token);
      setErrorMessage(null);
      setSuccessMessage('Signed in successfully.');
      refetch();
      emitAuthChanged();
    },
    onError: (e) => setErrorMessage(e.message),
  });

  const [signup, { loading: signupLoading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      const token = data?.signup?.token;
      if (token) setAuthToken(token);
      setErrorMessage(null);
      setSuccessMessage('Account created. You are signed in.');
      refetch();
      emitAuthChanged();
    },
    onError: (e) => setErrorMessage(e.message),
  });

  const [logout, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      clearAuthToken();
      setErrorMessage(null);
      setSuccessMessage('Signed out successfully.');
      refetch();
      emitAuthChanged();
    },
    onError: (e) => setErrorMessage(e.message),
  });

  const user = meData?.currentUser;

  if (meLoading) {
    return (
      <div className="p-3">
        <p className="text-muted mb-0">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="auth-mfe p-3">
      <ToastContainer
        position="top-end"
        className="p-3 position-fixed"
        style={{ zIndex: 1080 }}
      >
        <Toast
          bg="success"
          show={successMessage != null}
          onClose={() => setSuccessMessage(null)}
          delay={4500}
          autohide
        >
          <Toast.Header closeButton closeVariant="white" className="text-white border-0">
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{successMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h4 className="mb-3">Authentication</h4>
      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {user ? (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Signed in</Card.Title>
            <Card.Text className="mb-1">
              <strong>{user.username}</strong> ({user.email})
            </Card.Text>
            <Card.Text className="text-muted small mb-3">
              Role: {user.role} · ID: {user.id}
            </Card.Text>
            <Button
              variant="outline-danger"
              disabled={logoutLoading}
              onClick={() => logout()}
            >
              {logoutLoading ? 'Signing out…' : 'Log out'}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className="h6">Log in</Card.Title>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    login({
                      variables: {
                        username: loginUsername,
                        password: loginPassword,
                      },
                    });
                  }}
                >
                  <Form.Group className="mb-2">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </Form.Group>
                  <Button type="submit" disabled={loginLoading}>
                    {loginLoading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className="h6">Create account</Card.Title>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    signup({
                      variables: {
                        username: signupUsername,
                        password: signupPassword,
                        email: signupEmail,
                        role: signupRole,
                      },
                    });
                  }}
                >
                  <Form.Group className="mb-2">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                    >
                      <option value="resident">Resident</option>
                      <option value="business_owner">Business owner</option>
                      <option value="community_organizer">
                        Community organizer
                      </option>
                    </Form.Select>
                  </Form.Group>
                  <Button type="submit" variant="success" disabled={signupLoading}>
                    {signupLoading ? 'Creating…' : 'Sign up'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <p className="text-muted small mt-3 mb-0">
        Uses the API gateway at{' '}
        <code>{import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'}</code>
        . The session token is stored in this browser (JWT in{' '}
        <code>Authorization</code> after sign-in) so sign-in works across ports in
        development. Log in here before creating posts or help requests in
        Community.
      </p>
    </div>
  );
}
