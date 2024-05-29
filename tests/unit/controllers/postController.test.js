const postController = require('../../../controllers/post');
const postService = require('../../../services/post');
const User = require('../../../models/User');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

jest.mock('../../../services/post');
jest.mock('../../../models/User');
jest.mock('ejs');
jest.mock('fs');

describe('Post Controller - getPosts Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'userId' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render posts and users', async () => {
    const posts = [{ content: 'Test Post' }];
    const users = [{ name: 'Test User' }];

    postService.getPosts.mockResolvedValue(posts);
    User.find.mockResolvedValue(users);
    ejs.renderFile.mockResolvedValue('<html></html>');

    await postController.getPost(req, res);

    expect(postService.getPosts).toHaveBeenCalledWith('userId');
    expect(User.find).toHaveBeenCalledWith({ _id: { $ne: 'userId' } });
    expect(ejs.renderFile).toHaveBeenCalledWith('views/posts.ejs', { posts, users, user: req.user });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('<html></html>');
  });
});

describe('Post Controller - createPost', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'userId' },
      body: {
        content: 'Test Content',
        visibility: 'public',
      },
      file: { path: 'testPath' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a post with image', async () => {
    const post = { content: 'Test Content' };
    const imageBuffer = Buffer.from('imageData', 'base64');

    fs.readFileSync.mockReturnValue(imageBuffer);
    postService.createPost.mockResolvedValue(post);

    await postController.createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, post });
  });
});

describe('Post Controller - likePost', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'userId' },
      params: { postId: 'postId' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should like a post', async () => {
    const post = { likes: ['userId'] };

    postService.likePost.mockResolvedValue(post);

    await postController.likePost(req, res);

    expect(postService.likePost).toHaveBeenCalledWith('postId', 'userId');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, post });
  });
});

describe('Post Controller - addComment', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'userId' },
      params: { postId: 'postId' },
      body: { content: 'Test Comment' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a comment', async () => {
    const comment = { content: 'Test Comment' };

    postService.addComment.mockResolvedValue(comment);

    await postController.addComment(req, res);

    expect(postService.addComment).toHaveBeenCalledWith('postId', 'userId', 'Test Comment');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, comment });
  });
});

describe('Post Controller - addReply', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'userId' },
      params: { commentId: 'commentId' },
      body: { content: 'Test Reply' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a reply', async () => {
    const reply = { content: 'Test Reply' };

    postService.addReply.mockResolvedValue(reply);

    await postController.addReply(req, res);

    expect(postService.addReply).toHaveBeenCalledWith('commentId', 'userId', 'Test Reply');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, reply });
  });
});