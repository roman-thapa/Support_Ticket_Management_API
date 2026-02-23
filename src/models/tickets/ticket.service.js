const AppError = require("../utils/appError");
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
  if (!title || !description || !priority) {
    throw new AppError(
      "title, description and priority are required",
      400
    );
  }

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

  const allowedSortFields = [
    "created_at",
    "priority",
    "status",
  ];

  if (sort) {
    const field = sort.startsWith("-")
      ? sort.substring(1)
      : sort;

    if (!allowedSortFields.includes(field)) {
      throw new AppError("Invalid sort field", 400);
    }
  }

  const offset = (page - 1) * limit;

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

  const rows =
    await ticketRepository.executeQuery(
      dataQuery,
      dataValues
    );

  const countResult =
    await ticketRepository.executeQuery(
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