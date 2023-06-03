import CommentModel from '../models/Comment.js';
import PostModel from '../models/Post.js';

// ========== СОЗДАНИЕ КОММЕНТАРИЯ ==========
export const createComment = async (req, res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      user: req.userId,
    });

    const comment = await doc.save();
    console.log(comment);

    const postId = req.params.id;

    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 }, $push: { comments: comment } },
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
      message: 'Не удалось создать комментарий',
    });
  }
};
