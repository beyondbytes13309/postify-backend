const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require("path");
require('dotenv').config()
const session = require('express-session')
const passport = require('passport')

const { User } = require('./models/User');
const { connectToDB } = require('./utils/connectServices.js');
const auth = require('./routes/auth.js');

const initialize = require('./utils/localPassportConfig')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded( { extended: true } ))
app.use(cors({
    origin: '*'
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())

initialize(passport)

const mainFunction = async () => {

    await connectToDB(process.env.MONGODB_CONNECTION_STRING)
    app.use('/auth', auth(User))

}

app.get('/', (req, res) => {
    return res.send("Good to go!")
})

mainFunction()
.then(() => {
    app.listen(PORT, () => {
        console.log("Server is running...")
    })
})
