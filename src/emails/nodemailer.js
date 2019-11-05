const nodemailer = require('nodemailer')
const efig = require('./config')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'udinkomar2110@gmail.com',
        clientId: efig.clientId,
        clientSecret: efig.clientSecret,
        refreshToken: efig.refreshToken
    }
})

let sendVerification = (data) => {
    let mail = {
        from: 'Komarudin <udinkomar2110@gmail.com>',
        to: data.email,
        subject: 'Selamat Datang',
        html: `
        <div style="background-color: salmon; color: white; text-align: center; margin: 0 auto">
        <h1>Hello Bro whatsapp ${data.username}</h1>
        <form action="http://localhost:2077/verification/${data.username}">
        <input type="submit" value="CLICK TO VERIFIED" />
        </form>
        </div>
        `
    }
    transporter.sendMail(mail, (err, res) => {
        if (err) return console.log(err)
        console.log('Email Berhasil di kirim');
    })
}

module.exports = sendVerification