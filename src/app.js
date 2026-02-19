const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./models/user/user.routes");
const authRoutes = require("./models/auth/auth.routes");
const ticketRoutes = require('./models/tickets/ticket.routes')

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/tickets', ticketRoutes)

app.use(errorHandler);

module.exports = app;
