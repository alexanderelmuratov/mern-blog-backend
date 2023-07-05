import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';

// ========== ПОЛУЧЕНИЕ НОВЫХ СТАТЕЙ ==========
export const getNewPosts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const totalCount = await PostModel.countDocuments().exec();

    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user')
      .exec();

    const results = {
      posts,
      totalCount,
    };

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

// ========== ПОЛУЧЕНИЕ ПОПУЛЯРНЫХ СТАТЕЙ ==========
export const getPopularPosts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const totalCount = await PostModel.countDocuments().exec();

    const posts = await PostModel.find()
      .sort({ viewsCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user')
      .exec();

    const results = {
      posts,
      totalCount,
    };

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

// ========== ПОЛУЧЕНИЕ ЛИЧНЫХ СТАТЕЙ ==========
export const getOwnPosts = async (req, res) => {
  try {
    const { userId } = req;
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const totalCount = await PostModel.countDocuments({ user: userId }).exec();

    const posts = await PostModel.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .populate('user')
      .exec();

    const results = {
      posts,
      totalCount,
    };

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

// ========== ПОЛУЧЕНИЕ СТАТЕЙ ПО ТЕГУ ==========
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.query;

    const postsByTag = await PostModel.find({ tags: { $in: tag } })
      .populate('user')
      .exec();

    res.json(postsByTag);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

// ========== ПОЛУЧЕНИЕ ОДНОЙ СТАТЬИ ==========
export const getOnePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('user')
      .populate({ path: 'comments', populate: 'user' })
      .exec();

    if (!post) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось вернуть статью',
    });
  }
};

// ========== СОЗДАНИЕ СТАТЬИ ==========
export const createPost = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      image: req.body.image,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

// ========== УДАЛЕНИЕ СТАТЬИ ==========
export const removePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const postToRemove = await PostModel.findOneAndDelete({ _id: postId });

    if (!postToRemove) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    const commentIds = postToRemove.comments;
    await CommentModel.deleteMany({ _id: { $in: commentIds } });

    res.json({
      success: true,
      message: `Статья с ID ${postId} удалена`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось удалить статью',
    });
  }
};

// ========== ОБНОВЛЕНИЕ СТАТЬИ ==========
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const postToUpdate = await PostModel.findOneAndUpdate(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        image: req.body.image,
        user: req.userId,
      },
      { new: true }
    );

    if (!postToUpdate) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    res.json(postToUpdate);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

// ========== ПОЛУЧЕНИЕ СЛУЧАЙНЫХ ТЕГОВ ==========
export const getRandomTags = async (req, res) => {
  try {
    const random = Math.floor(Math.random() * 10);
    const posts = await PostModel.find().skip(random).exec();

    const tags = posts
      .map(post => post.tags)
      .flat()
      .slice(0, 7);

    res.json(tags);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить теги',
    });
  }
};
