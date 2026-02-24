const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/appError");
const commentService = require("./comment.service");

const {
  createCommentSchema,
} = require("../../validations/comment.validation");

exports.createComment = asyncHandler(async (req, res) => {
  const result = createCommentSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.errors[0].message, 400);
  }

  const comment = await commentService.createComment({
    ticketId: req.params.ticketId,
    userId: req.user.userId,
    message: result.data.message, 
  });

  return res.status(201).json({
    success: true,
    data: comment,
  });
});