const AppError = require("../../utils/appError");
const commentRepository = require("./comment.repository");
const ticketRepository = require("../tickets/ticket.repository");

exports.createComment = async ({ ticketId, userId, message }) => {
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (ticket.status === "closed") {
    throw new AppError("Cannot comment on a closed ticket", 400);
  }

  return await commentRepository.createComment({
    ticketId,
    userId,
    message,
  });
};