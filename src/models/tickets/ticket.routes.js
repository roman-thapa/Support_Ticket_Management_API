const express = require("express");
const route = express.Router();
const commentRoutes = require("../comment/comment.routes");

const {
  authenticateUser,
  authorizeRoles,
} = require("../../middlewares/auth.middleware");

const validate = require("../../middlewares/validate");

const {
  createTicketSchema,
  updateStatusSchema,
  assignTicketSchema,
} = require("../../validations/ticket.validation");

const { querySchema } = require("../../validations/query.validation");

const ticketController = require("./ticket.controller");

route.post(
  "/",
  authenticateUser,
  validate(createTicketSchema),
  ticketController.createTicket
);

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
  validate(querySchema, "query"),
  ticketController.getAllTickets
);

route.get("/:id", authenticateUser, ticketController.getTicketById);

route.use("/:id/comments", commentRoutes);

route.patch(
  "/:id/assign",
  authenticateUser,
  authorizeRoles("admin"),
  validate(assignTicketSchema),
  ticketController.assignTicket
);

route.patch(
  "/:id/status",
  authenticateUser,
  validate(updateStatusSchema),
  ticketController.updateTicketStatus
);

module.exports = route;