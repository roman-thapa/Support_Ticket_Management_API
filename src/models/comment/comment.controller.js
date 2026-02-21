const commentService = require('./comment.service')

exports.createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment({
      ticketId: req.params.id,
      userId: req.user.userId,
      message: req.body.message,
    });

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};
