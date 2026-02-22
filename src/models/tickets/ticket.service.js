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

exports.getTicketsWithQuery = async ({
  role,
  userId,
  page = 1,
  limit = 10,
  status,
  priority,
  sort,
}) => {
  // VALIDATION FIRST

  page = Number(page);
  limit = Number(limit);

  if (!Number.isInteger(page) || page < 1) {
    throw { statusCode: 400, message: "Invalid page value" };
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw { statusCode: 400, message: "Invalid limit value" };
  }

  const allowedSortFields = ["created_at", "priority", "status"];

  if (sort) {
    const field = sort.startsWith("-") ? sort.substring(1) : sort;
    if (!allowedSortFields.includes(field)) {
      throw { statusCode: 400, message: "Invalid sort field" };
    }
  }

  // Pagination
  const offset = (page - 1) * limit;

  // WHERE Builder
  let whereClauses = [];
  let values = [];
  let index = 1;

  if (role === "agent") {
    whereClauses.push(`assigned_to = $${index++}`);
    values.push(userId);
  } else if (role !== "admin") {
    whereClauses.push(`created_by = $${index++}`);
    values.push(userId);
  }

  if (status) {
    whereClauses.push(`status = $${index++}`);
    values.push(status);
  }

  if (priority) {
    whereClauses.push(`priority = $${index++}`);
    values.push(priority);
  }

  const whereSQL =
    whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

  // Sorting
  let orderBy = "created_at DESC";

  if (sort) {
    let direction = "ASC";
    let field = sort;

    if (sort.startsWith("-")) {
      direction = "DESC";
      field = sort.substring(1);
    }

    orderBy = `${field} ${direction}`;
  }

  //  Queries
  const dataQuery = `
    SELECT *
    FROM tickets
    ${whereSQL}
    ORDER BY ${orderBy}
    LIMIT $${index++}
    OFFSET $${index}
  `;

  const dataValues = [...values, limit, offset];

  const countQuery = `
    SELECT COUNT(*) FROM tickets
    ${whereSQL}
  `;

  // Repository Calls
  const rows = await ticketRepository.executeQuery(dataQuery, dataValues);
  const countResult = await ticketRepository.executeQuery(
    countQuery,
    values
  );

  const total = parseInt(countResult[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  return {
    status: "success",
    data: {
      total,
      page,
      limit,
      totalPages,
      results: rows,
    },
  };
};