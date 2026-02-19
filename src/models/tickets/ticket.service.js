const ticketRepository = require("./ticket.repository");

exports.createTicket = async ({ title, description, priority, userId }) => {
  if (!title || !description || !priority) {
    const error = new Error("title, description and priority are required");
    error.statusCode = 400;
    throw error;
  }

  const ticket = await ticketRepository.createTicket({
    title,
    description,
    priority,
    createdBy: userId,
  });

  return ticket;
};

exports.getMyTickets = async (userId) => {

  const tickets = await ticketRepository.getTicketsByUserId(userId);

  return tickets;
};

exports.getTicketById = async (ticketId, userId) => {
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  if (ticket.created_by !== userId) {
    const error = new Error("Forbidden: You do not own this ticket");
    error.statusCode = 403;
    throw error;
  }

  return ticket;
};
