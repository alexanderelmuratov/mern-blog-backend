import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

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
  createCommentValidation,
} from './validations.js';

import {
  UserController,
  PostController,
  CommentController,
} from './controllers/index.js';

mongoose
  .connect(process.env.MONGODB_HOST)
  .then(() => console.log('DB ok'))
  .catch(error => console.log('DB error', error));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

app.get('/posts/new', PostController.getNewPosts);
app.get('/posts/popular', PostController.getPopularPosts);
app.get('/posts/own', checkAuth, PostController.getOwnPosts);
app.get('/posts', PostController.getPostsByTag);
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
app.post(
  '/posts/:id',
  checkAuth,
  createCommentValidation,
  handleValidationErrors,
  CommentController.createComment
);

app.get('/tags', PostController.getRandomTags);
app.get('/comments', CommentController.getLastComments);

app.post('/uploads', checkAuth, upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.delete('/uploads', checkAuth, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.body.publicId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.listen(process.env.PORT || 4000, error => {
  if (error) {
    return console.log(error);
  }
  console.log('Server OK');
});
