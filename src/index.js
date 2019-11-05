const express = require('express')
const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/tasksRouter')
const app = express()
const port = process.env.PORT || 2077
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.get('/', (req, res) => {
res.send(`<h1>RUNNING AT PORT ${port}</h1>`)
})

app.listen(port, () => {
    console.log(`RUNNING AT PORT ${port}`)
})  