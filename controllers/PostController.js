import PostModel from '../models/Post.js';

// ========== ПОЛУЧЕНИЕ ВСЕХ СТАТЕЙ ==========
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();

    res.json(posts);
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
      imageUrl: req.body.imageUrl,
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
        imageUrl: req.body.imageUrl,
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

// ========== ПОЛУЧЕНИЕ ПОСЛЕДНИХ ТЭГОВ ==========
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map(post => post.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};
