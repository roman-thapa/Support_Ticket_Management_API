const ticketRepository = require("./ticket.repository");
const commentRepository = require("../comment/comment.repository");

const allowedTransitions = {
  open: ["in_progress"],
  in_progress: ["closed"],
  closed: [],
};

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

exports.updateTicketStatus = async ({ ticketId, newStatus, userId, role }) => {
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const isAdmin = role === "admin";
  const isAgentAssigned = role === "agent" && ticket.assigned_to === userId;
  const isOwnerClosing =
    role === "user" && ticket.created_by === userId && newStatus === "closed";

  if (!isAdmin && !isAgentAssigned && !isOwnerClosing) {
    const error = new Error("Forbidden: Not allowed to change status");
    error.statusCode = 403;
    throw error;
  }

  if (!isAdmin) {
    const currentStatus = ticket.status;
    const validNextStatuses = allowedTransitions[currentStatus] || [];

    if (!validNextStatuses.includes(newStatus)) {
      const error = new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (role === "agent" && newStatus === "closed") {
    const commentCount = await commentRepository.countAgentComments(
      ticketId,
      userId
    );

    if (commentCount === 0) {
      const error = new Error("Cannot close ticket without work log");
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedTicket = await ticketRepository.updateStatus(
    ticketId,
    newStatus
  );

  return updatedTicket;
};

exports.getAssignedTickets = async (userId) => {
  const tickets = await ticketRepository.getTicketsByAssignedUser(userId);
  return tickets;
};

exports.getAllTickets = async () => {
  const tickets = await ticketRepository.getAllTickets();
  return tickets;
};

exports.assignTicket = async ({ ticketId, agentId, role }) => {
  if (role !== "admin") {
    const error = new Error("Forbidden: Only admin can assign tickets");
    error.statusCode = 403;
    throw error;
  }

  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const agent = await ticketRepository.findUserById(agentId);

  if (!agent || agent.role !== "agent") {
    const error = new Error("Invalid agent");
    error.statusCode = 400;
    throw error;
  }

  const updatedTicket = await ticketRepository.assignTicket(ticketId, agentId);

  return updatedTicket;
};

exports.getTicketById = async (ticketId, userId, role) => {
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const isAdmin = role === "admin";
  const isOwner = ticket.created_by === userId;
  const isAssignedAgent = role === "agent" && ticket.assigned_to === userId;

  if (!isAdmin && !isOwner && !isAssignedAgent) {
    const error = new Error("Forbidden: You cannot access this ticket");
    error.statusCode = 403;
    throw error;
  }

  const comments = await commentRepository.getCommentsByTicketId(ticketId);

  return {
    ticket,
    comments,
  };
};
