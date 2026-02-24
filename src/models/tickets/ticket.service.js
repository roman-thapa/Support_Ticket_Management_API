const AppError = require("../../utils/appError");
const ticketRepository = require("./ticket.repository");
const commentRepository = require("../comment/comment.repository");

const allowedTransitions = {
  open: ["in_progress"],
  in_progress: ["closed"],
  closed: [],
};

/* =========================
   CREATE TICKET
========================= */
exports.createTicket = async ({ title, description, priority, userId }) => {
  return await ticketRepository.createTicket({
    title,
    description,
    priority,
    createdBy: userId,
  });
};

/* =========================
   GET MY TICKETS
========================= */
exports.getMyTickets = async (userId) => {
  return await ticketRepository.getTicketsByUserId(userId);
};

/* =========================
   GET TICKET BY ID (WITH COMMENTS)
========================= */
exports.getTicketById = async (ticketId, userId, role) => {
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const isAdmin = role === "admin";
  const isOwner = ticket.created_by === userId;
  const isAssignedAgent =
    role === "agent" && ticket.assigned_to === userId;

  if (!isAdmin && !isOwner && !isAssignedAgent) {
    throw new AppError("Forbidden: You cannot access this ticket", 403);
  }

  const comments =
    await commentRepository.getCommentsByTicketId(ticketId);

  return { ticket, comments };
};

/* =========================
   UPDATE STATUS
========================= */
exports.updateTicketStatus = async ({
  ticketId,
  newStatus,
  userId,
  role,
}) => {
  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const isAdmin = role === "admin";
  const isAgentAssigned =
    role === "agent" && ticket.assigned_to === userId;
  const isOwnerClosing =
    role === "user" &&
    ticket.created_by === userId &&
    newStatus === "closed";

  if (!isAdmin && !isAgentAssigned && !isOwnerClosing) {
    throw new AppError(
      "Forbidden: Not allowed to change status",
      403
    );
  }

  if (!isAdmin) {
    const currentStatus = ticket.status;
    const validNextStatuses =
      allowedTransitions[currentStatus] || [];

    if (!validNextStatuses.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  if (role === "agent" && newStatus === "closed") {
    const commentCount =
      await commentRepository.countAgentComments(
        ticketId,
        userId
      );

    if (commentCount === 0) {
      throw new AppError(
        "Cannot close ticket without work log",
        400
      );
    }
  }

  return await ticketRepository.updateStatus(
    ticketId,
    newStatus
  );
};

/* =========================
   GET ASSIGNED TICKETS
========================= */
exports.getAssignedTickets = async (userId) => {
  return await ticketRepository.getTicketsByAssignedUser(
    userId
  );
};

/* =========================
   ASSIGN TICKET (ADMIN ONLY)
========================= */
exports.assignTicket = async ({
  ticketId,
  agentId,
  role,
}) => {
  if (role !== "admin") {
    throw new AppError(
      "Forbidden: Only admin can assign tickets",
      403
    );
  }

  const ticket = await ticketRepository.findById(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const agent = await ticketRepository.findUserById(agentId);

  if (!agent || agent.role !== "agent") {
    throw new AppError("Invalid agent", 400);
  }

  return await ticketRepository.assignTicket(
    ticketId,
    agentId
  );
};

/* =========================
   ADVANCED QUERY + PAGINATION
========================= */
exports.getTicketsWithQuery = async ({
  role,
  userId,
  page = 1,
  limit = 10,
  status,
  priority,
  sort,
}) => {
  page = Number(page);
  limit = Number(limit);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("Invalid page value", 400);
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("Invalid limit value", 400);
  }

  const allowedSortFields = ["created_at", "priority", "status"];

  if (sort) {
    const field = sort.startsWith("-")
      ? sort.substring(1)
      : sort;

    if (!allowedSortFields.includes(field)) {
      throw new AppError("Invalid sort field", 400);
    }
  }

  return await ticketRepository.getTicketsWithFilters({
    role,
    userId,
    page,
    limit,
    status,
    priority,
    sort,
  });
};