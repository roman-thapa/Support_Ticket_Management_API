const { z } = require("zod");

const createCommentSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

module.exports = {
  createCommentSchema,
};