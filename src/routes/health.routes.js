const express = require('express')
const router = express.Router()

router.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Support Ticket API running",
    })
})

module.exports = router