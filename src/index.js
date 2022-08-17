const express = require('express')
require('../db/mongoose')
const bookRouter = require('../routers/bookRouter')
const userRouter = require('../routers/user')
const port = 3000;
const morgan = require('morgan')

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use('/books', bookRouter)
app.use(userRouter)

app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})