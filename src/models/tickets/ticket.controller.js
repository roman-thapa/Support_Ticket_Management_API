const { default: next } = require('next')
const ticketService = require('./ticket.service')

exports.createTicket = async (req, res, next) => {
    try {
        const ticket = await ticketService.createTicket({
            ...req.body,
            userId: req.user.userId
        })
        return res.status(201).json({
            success: true,
            data: ticket
        })
    } catch (error) {
        next(error)
    }
}

exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user.userId);

    return res.status(200).json({
      success: true,
      data: tickets
    });

  } catch (error) {
    next(error);
  }
};


exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(
      req.params.id,
      req.user.userId  
    );

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateTicketStatus = async (req, res, next) => {
  try {
    const updatedTicket = await ticketService.updateTicketStatus({
      ticketId: req.params.id,
      newStatus: req.body.status,
      userId: req.user.userId,
      role: req.user.role
    });

    return res.status(200).json({
      success: true,
      data: updatedTicket
    });

  } catch (error) {
    next(error);
  }
}

exports.getAssignedTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getAssignedTickets(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: tickets
    });

  } catch (error) {
    next(error);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getTicketsWithQuery({
      role: req.user.role,
      userId: req.user.userId,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      priority: req.query.priority,
      sort: req.query.sort,
    });

    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const assignedTicket = await ticketService.assignTicket({
      ticketId: req.params.id,
      agentId: req.body.assigned_to,
      adminId: req.user.userId, 
      role: req.user.role
    });

    return res.status(200).json({
      success: true,
      data: assignedTicket
    });

  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const result = await ticketService.getTicketById(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};