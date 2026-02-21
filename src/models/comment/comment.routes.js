const express = require("express");
const route = express.Router({ mergeParams: true });

const { authenticateUser } = require("../../middlewares/auth.middleware");
const commentController = require("./comment.controller");

route.post(
  "/",
  authenticateUser,
  commentController.createComment
);

module.exports = route;