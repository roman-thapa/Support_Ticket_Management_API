const AppError = require("../utils/appError");
const commentRepository = require("./comment.repository");
const ticketRepository = require("../tickets/ticket.repository");

exports.createComment = async ({ ticketId, userId, message }) => {
  // A️⃣ Validate message
  if (!message || message.trim() === "") {
    throw new AppError("Comment message is required", 400);
  }

  // B️⃣ Verify Ticket Exists
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  // C️⃣ Check Ticket Status
  if (ticket.status === "closed") {
    throw new AppError("Cannot comment on a closed ticket", 400);
  }

  // D️⃣ Create Comment
  const comment = await commentRepository.createComment({
    ticketId,
    userId,
    message,
  });

  return comment;
};