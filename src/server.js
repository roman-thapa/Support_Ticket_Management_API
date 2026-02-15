require('dotenv').config()
require('./config/db')
const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`server is runnning on ${PORT}`)
})