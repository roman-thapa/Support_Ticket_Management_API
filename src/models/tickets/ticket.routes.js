const express = require("express");
const route = express.Router();

const {
  authenticateUser,
  authorizeRoles,
} = require("../../middlewares/auth.middleware");
const ticketController = require("./ticket.controller");

route.post("/", authenticateUser, ticketController.createTicket);

route.get("/my", authenticateUser, ticketController.getMyTickets);

route.get(
  "/assigned",
  authenticateUser,
  authorizeRoles("agent"),
  ticketController.getAssignedTickets
);

route.get(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  ticketController.getAllTickets
);

route.get("/:id", authenticateUser, ticketController.getTicketById);

route.patch(
  "/:id/assign",
  authenticateUser,
  authorizeRoles("admin"),
  ticketController.assignTicket
);

route.patch(
  "/:id/status",
  authenticateUser,
  ticketController.updateTicketStatus
);

module.exports = route;
