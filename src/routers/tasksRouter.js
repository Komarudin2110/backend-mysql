const conn = require('../connection/index')
const router = require('express').Router()

// GET ALL TASKS
router.get('/tasks', (req, res) => {
    let sql = `SELECT * FROM tasks`

    conn.query(sql, (err, result) => {
        err ? res.send(err) : res.send(result)
    })
})

// GET ALL OWN TASKS
router.get('/tasks/:userid', (req, res) => {
    let sql = `SELECT * FROM tasks where user_id = '${req.params.userid}'`

    conn.query(sql, (err, result) => {
        err ? res.send(err) : res.send(result)
    })
})

// GET TASK BY ID
router.get('/search/:taskid', (req, res) => {
    let sql = `SELECT * FROM tasks where id = '${req.params.taskid}'`

    conn.query(sql, (err, result) => {
        err ? res.send(err) : res.send(result)
    })
})

// CREATE TASK 
router.post('/tasks/create', (req, res) => {
    let data = req.body
    let sql = `INSERT INTO  tasks SET ?`
    let sql2 = `SELECT * FROM tasks`

    conn.query(sql, data, (err, resp) => {
        err ? res.send(err) :
            conn.query(sql2, (error, respo) => {
                err ? res.send(error) : res.send(respo)
            })
    })
})

// UPDATE TASK
router.patch('/update/:taskid', (req, res) => {
    let sql = `UPDATE tasks SET ? WHERE id = ?`
    let data = [req.body, req.params.taskid]
    let sql2 = `SELECT * FROM tasks WHERE ID = ${data[1]}`
    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)
        conn.query(sql2, (error, respo) => {
            if (error) return res.send(error)
            res.send(respo)
        })
    })
})

// DELETE TASK 
router.delete('/delete/:taskid', (req, res) => {
    let sql = `DELETE FROM tasks WHERE id = '${req.params.taskid}'`

    conn.query(sql, (err, resp) => {
        err ? res.send(err) : res.send({ success: 'Success delete Task !' })
    })
})
module.exports = router