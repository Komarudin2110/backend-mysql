const conn = require('../connection/index')
const router = require('express').Router()
const valid = require('validator')
const bcryptjs = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sendVerification = require('../emails/nodemailer.js')

const uploadDirectory = path.join(__dirname, '/../../public/uploads/')

// Menentukan dimana foto kan disimpan, dan bagaimana foto diberi nama 
const _storage = multer.diskStorage({
    // Menentukan folder penyimpanan foto
    destination: function (req, file, cb) {
        cb(null, uploadDirectory)
    },
    // Menentukan pola nama file 
    filename: function (req, file, cb) {
        cb(null, "avatar-" + req.params.username + path.extname(file.originalname))
    }
})

// Configurasi  Multer
const upload = multer({
    storage: _storage,
    limits: {
        fileSize: 1000000 // Byte, Max 1mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please Upload image file (jpg, jpeg, or png'))
        }
        cb(undefined, true)
    }
})

// POST AVATAR 
router.post('/avatar/:username', (req, res, next) => {
    // Mencari user bedasarkan name
    const sql = `SELECT * FROM users WHERE username = '${req.params.username}'`
    conn.query(sql, (err, resp) => {
        if (err) return res.send({ error: err.message })
        let user = resp[0]
        if (!user) return res.send({ error: 'User Not Found !' })
        req.user = user
        next()
    })
}, upload.single('avatar'), (req, res) => {
    // Jika ditemukan, Simpan nama foto ke dalam kolom avatar pada user tersebut
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}' WHERE username = '${req.user.username}'`
    // Simpan nama foto yang baru di upload
    conn.query(sql2, (err, resp) => {
        if (err) return res.send({ error: err.message })
        res.send({ filename: req.file.filename })
    })
})

// ACCES AVATAR
router.get('/avatar/:imageName', (req, res) => {
    let LetakFolder = {
        root: uploadDirectory
    }
    let namaFile = req.params.imageName
    res.sendFile(namaFile, LetakFolder, function (err) {
        if (err) return res.send({ err: err.message })
    })
})

// DELETE AVATAR
router.delete('/avatar/:username', (req, res) => {
    let sql = `SELECT avatar FROM users WHERE username = '${req.params.username}'`
    let sql2 = `UPDATE users SET avatar = null WHERE username = '${req.params.username}'`
    conn.query(sql, (err, result) => {
        if (err) return res.send(err)
        if (!result[0].avatar) {
            return res.send({ err: 'Image Not Found' })
        }
        let imgPath = uploadDirectory + result[0].avatar
        fs.unlink(imgPath, (err) => {
            if (err) return res.send(err)
            conn.query(sql2, (err, result) => {
                if (err) return res.send(err)
                res.send({ success: 'Image berhasil di hapus' })
            })
        })
    })
})


// READ ALL USERS
router.get('/users', (req, res) => {
    let sql = `SELECT * FROM users`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
    })
})

// CREATE USER V1
router.post('/usersv1', (req, res) => {
    let { username, name, email, password } = req.body
    let sql = `INSERT INTO users(username,name,email,password) 
                VALUES ('${username}', '${name}', '${email}', '${password}')`
    conn.query(sql, (err, result) => {
        if (err) return res.send(err)
        // sendVerification(email, username)
        res.send({ success: 'Register Success !' })
    })
})

// CREATE USER V2
router.post('/users', (req, res) => {
    let sql = `INSERT INTO users SET ?`
    let data = req.body // { username, name, email, password }

    // Cek Format Email
    if (!valid.isEmail(data.email)) return (res.send({ error: 'Format Email Salah !' }))
    // Hash Password
    data.password = bcryptjs.hashSync(data.password, 8)

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)
        sendVerification(data)
        res.send({ success: 'Register Success !' })
    })
})

// DELETE USER
router.delete('/users/:userid', (req, res) => {
    let sql = `DELETE FROM users WHERE id = ${req.params.userid}`

    conn.query(sql, (err, resp) => {
        if (err) return res.send(err)

        res.send({ success: 'User berhasil di delete' })
    })
})

// UPDATE USER BY ID
router.patch('/users/:userid', (req, res) => {
    let sql = `UPDATE users SET ? WHERE id = ?`
    if (req.body.password) req.body.password = bcryptjs.hashSync(req.body.password, 8)
    let data = [req.body, req.params.userid]

    conn.query(sql, data, (err, resp) => {
        if (err) return res.send(err)
        res.send({ success: 'Data berhasil di update !' })
    })
})

// LOGIN USER
router.post('/users/login', (req, res) => {
    let { userlogin, password } = req.body
    let sql = `SELECT * FROM users WHERE email = '${userlogin}' OR username = '${userlogin}'`
    conn.query(sql, (err, resp) => {
        if (err) return (res.send(err))
        if (resp.length === 0) return res.send({ error: 'User Not Found !' })
        let user = resp[0]
        let hash = bcryptjs.compareSync(password, user.password)
        if (!hash) return res.send({ error: 'Wrong Password !' })
        if (!user.verified) return res.send({ error: 'Please Verification your Email !' })
        res.send({ success: 'Login success' })
    })
})

// VERIFICATION USER
router.get('/verification/:username', (req, res) => {
    let sql = `UPDATE users SET verified = true WHERE username = '${req.params.username}'`
    conn.query(sql, (err, result) => {
        if (err) return res.send(err)
        res.send('Verifikasi Success')
    })
})

// READ PROFILE USER
router.get('/users/profile/:username', (req, res) => {
    let sql = `SELECT * FROM users WHERE username = '${req.params.username}'`
    conn.query(sql, (err, result) => {
        if (err) return res.send({ error: err.message })
        let user = result[0]
        if (!user) return res.send({ error: "User Not Found !" })
        res.send({
            ...user,
            avatar: `http://localhost:2077/avatar/${user.avatar}`
        })
    })
})

module.exports = router