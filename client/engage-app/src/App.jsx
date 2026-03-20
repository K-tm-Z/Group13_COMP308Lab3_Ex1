import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const ME_QUERY = gql`
  query EngageCurrentUser {
    currentUser {
      id
      username
      email
      role
    }
  }
`;

const POSTS_BY_CATEGORY = gql`
  query EngagePostsByCategory($category: PostCategory!) {
    postsByCategory(category: $category) {
      id
      authorId
      title
      content
      category
      aiSummary
      createdAt
    }
  }
`;

const HELP_REQUESTS = gql`
  query EngageHelpRequests {
    helpRequests {
      id
      authorId
      description
      location
      isResolved
      volunteerIds
      createdAt
    }
  }
`;

const CREATE_POST = gql`
  mutation EngageCreatePost(
    $authorId: ID!
    $title: String!
    $content: String!
    $category: PostCategory!
    $aiSummary: String
  ) {
    createPost(
      authorId: $authorId
      title: $title
      content: $content
      category: $category
      aiSummary: $aiSummary
    ) {
      id
      title
      category
      createdAt
    }
  }
`;

const CREATE_HELP = gql`
  mutation EngageCreateHelp($authorId: ID!, $description: String!, $location: String) {
    createHelpRequest(authorId: $authorId, description: $description, location: $location) {
      id
      description
      location
    }
  }
`;

const UPDATE_HELP = gql`
  mutation EngageUpdateHelp($id: ID!, $isResolved: Boolean) {
    updateHelpRequest(id: $id, isResolved: $isResolved) {
      id
      isResolved
    }
  }
`;

const ADD_VOLUNTEER = gql`
  mutation EngageAddVolunteer($requestId: ID!, $userId: ID!) {
    addVolunteer(requestId: $requestId, userId: $userId) {
      id
      volunteerIds
    }
  }
`;

function PostList({ category }) {
  const { data, loading, error, refetch } = useQuery(POSTS_BY_CATEGORY, {
    variables: { category },
    fetchPolicy: 'network-only',
  });

  if (loading) return <p className="text-muted small">Loading posts…</p>;
  if (error)
    return (
      <Alert variant="warning" className="mb-0">
        {error.message}
      </Alert>
    );

  const posts = data?.postsByCategory ?? [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="small text-muted">{posts.length} post(s)</span>
        <Button size="sm" variant="outline-secondary" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>
      {posts.length === 0 ? (
        <p className="text-muted small mb-0">No posts yet.</p>
      ) : (
        posts.map((p) => (
          <Card key={p.id} className="mb-2">
            <Card.Body>
              <Card.Title className="h6">{p.title}</Card.Title>
              <div className="small text-muted mb-2">
                <Badge bg="secondary">{p.category}</Badge>{' '}
                <span className="ms-1">{new Date(p.createdAt).toLocaleString()}</span>
              </div>
              <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{p.content}</Card.Text>
              {p.aiSummary && (
                <Card.Text className="small text-muted mb-0">
                  <em>AI summary:</em> {p.aiSummary}
                </Card.Text>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
}

export default function App() {
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });
  const userId = meData?.currentUser?.id ?? null;

  const {
    data: helpData,
    loading: helpLoading,
    error: helpError,
    refetch: refetchHelp,
  } = useQuery(HELP_REQUESTS, { fetchPolicy: 'network-only' });

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postAiSummary, setPostAiSummary] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [helpLocation, setHelpLocation] = useState('');
  const [formError, setFormError] = useState(null);
  const [activeTab, setActiveTab] = useState('news');

  const [createPost, { loading: creatingPost }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setFormError(null);
      setPostTitle('');
      setPostContent('');
      setPostAiSummary('');
    },
    onError: (e) => setFormError(e.message),
    refetchQueries: [
      { query: POSTS_BY_CATEGORY, variables: { category: 'news' } },
      { query: POSTS_BY_CATEGORY, variables: { category: 'discussion' } },
    ],
  });

  const [createHelp, { loading: creatingHelp }] = useMutation(CREATE_HELP, {
    onCompleted: () => {
      setFormError(null);
      setHelpDescription('');
      setHelpLocation('');
      refetchHelp();
    },
    onError: (e) => setFormError(e.message),
  });

  const [toggleResolved] = useMutation(UPDATE_HELP, {
    onCompleted: () => refetchHelp(),
  });

  const [addVolunteer] = useMutation(ADD_VOLUNTEER, {
    onCompleted: () => refetchHelp(),
    onError: (e) => setFormError(e.message),
  });

  const helpRequests = helpData?.helpRequests ?? [];

  return (
    <div className="engage-mfe p-3">
      <h4 className="mb-3">Community engagement</h4>

      {meLoading ? (
        <p className="text-muted small">Loading profile…</p>
      ) : userId ? (
        <Alert variant="light" className="border py-2">
          Posting as <strong>{meData?.currentUser?.username}</strong> (ID:{' '}
          <code>{userId}</code>)
        </Alert>
      ) : (
        <Alert variant="info">
          You are not logged in. Open <strong>Authentication</strong> in the
          shell to sign in — you need your user ID to create posts or help
          requests.
        </Alert>
      )}

      {formError && (
        <Alert variant="danger" dismissible onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <Tab.Container
        id="engage-tabs"
        activeKey={activeTab}
        onSelect={(k) => k && setActiveTab(k)}
      >
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="news">News</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="discussion">Discussions</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="help">Help requests</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="news">
            <Row className="g-3">
              <Col lg={5}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title className="h6">New news post</Card.Title>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!userId) {
                          setFormError('Log in first (Authentication tab).');
                          return;
                        }
                        createPost({
                          variables: {
                            authorId: userId,
                            title: postTitle,
                            content: postContent,
                            category: 'news',
                            aiSummary: postAiSummary || null,
                          },
                        });
                      }}
                    >
                      <Form.Group className="mb-2">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>AI summary (optional)</Form.Label>
                        <Form.Control
                          value={postAiSummary}
                          onChange={(e) => setPostAiSummary(e.target.value)}
                        />
                      </Form.Group>
                      <Button type="submit" disabled={creatingPost || !userId}>
                        {creatingPost ? 'Publishing…' : 'Publish news'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <h6 className="text-muted">News feed</h6>
                <PostList category="news" />
              </Col>
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="discussion">
            <Row className="g-3">
              <Col lg={5}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title className="h6">Start a discussion</Card.Title>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!userId) {
                          setFormError('Log in first (Authentication tab).');
                          return;
                        }
                        createPost({
                          variables: {
                            authorId: userId,
                            title: postTitle,
                            content: postContent,
                            category: 'discussion',
                            aiSummary: postAiSummary || null,
                          },
                        });
                      }}
                    >
                      <Form.Group className="mb-2">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
 required
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
 required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>AI summary (optional)</Form.Label>
                        <Form.Control
                          value={postAiSummary}
                          onChange={(e) => setPostAiSummary(e.target.value)}
                        />
                      </Form.Group>
                      <Button type="submit" disabled={creatingPost || !userId}>
                        {creatingPost ? 'Publishing…' : 'Post discussion'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <h6 className="text-muted">Discussions</h6>
                <PostList category="discussion" />
              </Col>
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="help">
            <Row className="g-3">
              <Col lg={5}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title className="h6">Request help</Card.Title>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!userId) {
                          setFormError('Log in first (Authentication tab).');
                          return;
                        }
                        createHelp({
                          variables: {
                            authorId: userId,
                            description: helpDescription,
                            location: helpLocation || null,
                          },
                        });
                      }}
                    >
                      <Form.Group className="mb-2">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={helpDescription}
                          onChange={(e) => setHelpDescription(e.target.value)}
 required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Location (optional)</Form.Label>
                        <Form.Control
                          value={helpLocation}
                          onChange={(e) => setHelpLocation(e.target.value)}
                        />
                      </Form.Group>
                      <Button type="submit" disabled={creatingHelp || !userId}>
                        {creatingHelp ? 'Submitting…' : 'Submit request'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={7}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-muted mb-0">All help requests</h6>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => refetchHelp()}
                  >
                    Refresh
                  </Button>
                </div>
                {helpLoading && (
                  <p className="text-muted small">Loading help requests…</p>
                )}
                {helpError && (
                  <Alert variant="warning">{helpError.message}</Alert>
                )}
                {!helpLoading && helpRequests.length === 0 && (
                  <p className="text-muted small">No help requests yet.</p>
                )}
                {helpRequests.map((h) => (
                  <Card key={h.id} className="mb-2">
                    <Card.Body>
                      <div className="d-flex justify-content-between gap-2 flex-wrap">
                        <Badge bg={h.isResolved ? 'success' : 'warning'}>
                          {h.isResolved ? 'Resolved' : 'Open'}
                        </Badge>
                        <span className="small text-muted">
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <Card.Text className="mt-2 mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                        {h.description}
                      </Card.Text>
                      {h.location && (
                        <Card.Text className="small text-muted mb-2">
                          📍 {h.location}
                        </Card.Text>
                      )}
                      <Card.Text className="small mb-2">
                        Volunteers:{' '}
                        {h.volunteerIds?.length
                          ? h.volunteerIds.join(', ')
                          : '—'}
                      </Card.Text>
                      <div className="d-flex flex-wrap gap-2">
                        {userId &&
                          !h.isResolved &&
                          !h.volunteerIds?.includes(userId) && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                addVolunteer({
                                  variables: { requestId: h.id, userId },
                                })
                              }
                            >
                              Volunteer
                            </Button>
                          )}
                        {userId && h.authorId === userId && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() =>
                              toggleResolved({
                                variables: {
                                  id: h.id,
                                  isResolved: !h.isResolved,
                                },
                              })
                            }
                          >
                            Mark {h.isResolved ? 'open' : 'resolved'}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}
