import express from "express";
import bodyParser from "body-parser";
const app = express();
const port = 3000;

let posts = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', (req, res) => {
  const { title, content } = req.body;
  const newPost = { title, content };
  posts.push(newPost);
  res.redirect('/');
});

app.get('/edit/:postId', (req, res) => {
  const postId = req.params.postId;
  const postToEdit = posts[postId];
  res.render('edit', { postToEdit, postId });
});

app.post('/edit/:postId', (req, res) => {
  const postId = req.params.postId;
  const { title, content } = req.body;
  posts[postId] = { title, content };
  res.redirect('/');
});

app.get('/delete/:postId', (req, res) => {
  const postId = req.params.postId;
  posts.splice(postId, 1);
  res.redirect('/');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
