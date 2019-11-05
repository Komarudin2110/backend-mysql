const express = require('express')
const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/tasksRouter')
const app = express()
const port = process.env.PORT || 2077
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port, () => {
    res.send(`<h1>Running At Port ${port}</h1>`)
})  