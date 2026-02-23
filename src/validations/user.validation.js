const { z } = require("zod");

const roleEnum = z.enum(["user", "agent", "admin"]);

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: roleEnum.optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

module.exports = {
  createUserSchema,
  idParamSchema,
};