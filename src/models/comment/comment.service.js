const commentRepository = require("./comment.repository");
const ticketRepository = require("../tickets/ticket.repository");

exports.createComment = async ({ ticketId, userId, message }) => {
  // A️⃣ Validate message
  if (!message || message.trim() === "") {
    const error = new Error("Comment message is required");
    error.statusCode = 400;
    throw error;
  }

  // A️⃣ Verify Ticket Exists
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  // B️⃣ Check Ticket Status
  if (ticket.status === "closed") {
    const error = new Error("Cannot comment on a closed ticket");
    error.statusCode = 400;
    throw error;
  }

  // C️⃣ Create Comment
  const comment = await commentRepository.createComment({
    ticketId,
    userId,
    message,
  });

  return comment;
};
