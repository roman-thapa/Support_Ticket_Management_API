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
