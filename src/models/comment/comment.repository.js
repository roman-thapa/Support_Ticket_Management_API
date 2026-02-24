const pool = require("../../config/db");

/**
 * Insert new comment
 */
exports.createComment = async ({ ticketId, userId, message }) => {
  const query = `
    INSERT INTO comments (ticket_id, user_id, message)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    ticketId,
    userId,
    message,
  ]);

  return rows[0];
};

/**
 * Fetch comments by ticket_id
 * Ordered ASC (oldest first)
 */
exports.getCommentsByTicketId = async (ticketId) => {
  const query = `
    SELECT *
    FROM comments
    WHERE ticket_id = $1
    ORDER BY created_at ASC;
  `;

  const { rows } = await pool.query(query, [ticketId]);

  return rows;
};

exports.countAgentComments = async (ticketId, agentId) => {
  const query = `
    SELECT COUNT(*) 
    FROM comments
    WHERE ticket_id = $1
      AND user_id = $2
  `;

  const { rows } = await pool.query(query, [ticketId, agentId]);

  return Number(rows[0].count);
};