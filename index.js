import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import {
  checkAuth,
  upload,
  handleValidationErrors,
} from './middlewares/index.js';

import {
  registerValidation,
  loginValidation,
  createPostValidation,
  updatePostValidation,
} from './validations.js';

import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect(
    'mongodb+srv://admin:LX7rFrP4sqTA0j2Y@cluster0.mxnwm7p.mongodb.net/blog?retryWrites=true&w=majority'
  )
  .then(() => console.log('DB ok'))
  .catch(error => console.log('DB error', error));

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAllPosts);
app.get('/posts/:id', PostController.getOnePost);
app.post(
  '/posts',
  checkAuth,
  createPostValidation,
  handleValidationErrors,
  PostController.createPost
);
app.delete('/posts/:id', checkAuth, PostController.removePost);
app.patch(
  '/posts/:id',
  checkAuth,
  updatePostValidation,
  handleValidationErrors,
  PostController.updatePost
);
app.get('/posts/tags', PostController.getLastTags);

app.post('/uploads', checkAuth, upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.originalname}` });
});

app.listen(4000, error => {
  if (error) {
    return console.log(error);
  }
  console.log('Server OK');
});
