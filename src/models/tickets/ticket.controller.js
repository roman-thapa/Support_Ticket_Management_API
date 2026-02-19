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
