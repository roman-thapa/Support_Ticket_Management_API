const express = require("express");
const route = express.Router();

const { authenticateUser } = require("../../middlewares/auth.middleware");
const ticketController = require("./ticket.controller");

route.post("/", authenticateUser, ticketController.createTicket);

route.get(
    '/my',
    authenticateUser,
    ticketController.getMyTickets
);

route.get("/:id", authenticateUser, ticketController.getTicketById);

module.exports = route;
