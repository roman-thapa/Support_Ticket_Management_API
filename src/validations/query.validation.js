const { z } = require("zod");

const sortWhitelist = ["created_at", "updated_at", "priority", "status"];

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;

        const field = val.replace("-", "");
        return sortWhitelist.includes(field);
      },
      { message: "Invalid sort field" }
    ),
});

module.exports = {
  querySchema,
  sortWhitelist,
};