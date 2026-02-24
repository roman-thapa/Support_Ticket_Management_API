const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/appError");
const ticketService = require("./ticket.service");

const {
  createTicketSchema,
  updateStatusSchema,
  assignTicketSchema,
} = require("../../validations/ticket.validation");

const { querySchema } = require("../../validations/query.validation");


// Create Ticket
exports.createTicket = asyncHandler(async (req, res) => {
  const result = createTicketSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.errors[0].message, 400);
  }

  const ticket = await ticketService.createTicket({
    ...result.data,
    userId: req.user.userId,
  });

  return res.status(201).json({
    success: true,
    data: ticket,
  });
});


// Get My Tickets (User)
exports.getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getMyTickets(req.user.userId);

  return res.status(200).json({
    success: true,
    data: tickets,
  });
});


// Get Ticket By ID (Role-Based Access)
exports.getTicketById = asyncHandler(async (req, res) => {
  const result = await ticketService.getTicketById(
    req.params.id,
    req.user.userId,
    req.user.role
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// Update Ticket Status
exports.updateTicketStatus = asyncHandler(async (req, res) => {
  const validation = updateStatusSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const updatedTicket = await ticketService.updateTicketStatus({
    ticketId: req.params.id,
    newStatus: validation.data.status,
    userId: req.user.userId,
    role: req.user.role,
  });

  return res.status(200).json({
    success: true,
    data: updatedTicket,
  });
});


// Get Assigned Tickets (Agent)
exports.getAssignedTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getAssignedTickets(req.user.userId);

  return res.status(200).json({
    success: true,
    data: tickets,
  });
});


// Get All Tickets (Admin / Query Support)
exports.getAllTickets = asyncHandler(async (req, res) => {
  const queryValidation = querySchema.safeParse(req.query);

  if (!queryValidation.success) {
    throw new AppError(queryValidation.error.errors[0].message, 400);
  }

  const result = await ticketService.getTicketsWithQuery({
    role: req.user.role,
    userId: req.user.userId,
    ...queryValidation.data,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// Assign Ticket (Admin Only)
exports.assignTicket = asyncHandler(async (req, res) => {
  const validation = assignTicketSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const assignedTicket = await ticketService.assignTicket({
    ticketId: req.params.id,
    agentId: validation.data.assigned_to,
    adminId: req.user.userId,
    role: req.user.role,
  });

  return res.status(200).json({
    success: true,
    data: assignedTicket,
  });
});