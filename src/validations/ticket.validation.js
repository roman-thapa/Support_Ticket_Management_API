const { z } = require("zod");

const priorityEnum = z.enum(["low", "medium", "high"]);
const statusEnum = z.enum(["open", "in_progress", "closed"]);

const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: priorityEnum,
});

const updateStatusSchema = z.object({
  status: statusEnum,
});

module.exports = {
  createTicketSchema,
  updateStatusSchema,
};