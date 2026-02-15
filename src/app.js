const express = require("express")
const cors = require("cors")
const errorHandler = require('./middlewares/error.middleware')
const healthRoutes = require('./routes/health.routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', healthRoutes)
app.use(errorHandler)

module.exports = app