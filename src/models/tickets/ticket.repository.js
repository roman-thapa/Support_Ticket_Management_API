const pool = require("../../config/db"); // adjust to your DB file

exports.createTicket = async ({ title, description, priority, createdBy }) => {
  const query = `
    INSERT INTO tickets (title, description, priority, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [title, description, priority, createdBy];

  const { rows } = await pool.query(query, values);

  return rows[0];
};

exports.getTicketsByUserId = async (userId) => {
  const query = `
    SELECT *
    FROM tickets
    WHERE created_by = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
};

exports.findById = async (id) => {
  const result = await pool.query("SELECT * FROM tickets WHERE id = $1", [id]);

  return result.rows[0];
};

exports.updateStatus = async (id, status) => {
  const query = `
    UPDATE tickets
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [status, id]);

  return rows[0];
};

exports.getTicketsByAssignedUser = async (userId) => {
  const query = `
    SELECT *
    FROM tickets
    WHERE assigned_to = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows;
};

exports.getAllTickets = async () => {
  const query = `
    SELECT *
    FROM tickets
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};



exports.findUserById = async (userId) => {
  const query = `
    SELECT id, role
    FROM users
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

exports.assignTicket = async (ticketId, agentId) => {
  const query = `
    UPDATE tickets
    SET assigned_to = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [agentId, ticketId]);
  return rows[0];
}; 

exports.getTicketsWithFilters = async ({
  role,
  userId,
  page,
  limit,
  status,
  priority,
  sort,
}) => {
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let values = [];
  let index = 1;

  // Role-based filtering
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

  const countQuery = `
    SELECT COUNT(*) FROM tickets
    ${whereSQL}
  `;

  const dataValues = [...values, limit, offset];

  const { rows } = await pool.query(dataQuery, dataValues);
  const countResult = await pool.query(countQuery, values);

  const total = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    results: rows,
  };
};