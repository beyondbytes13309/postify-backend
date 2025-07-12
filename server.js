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
const user = require('./routes/user.js')

const { checkAuth, authorize } = require('./middleware/authVerification.js')

const initialize = require('./utils/passportConfig.js')
const { setupCloudinary } = require('./utils/cloudinaryConfig.js')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded( { extended: true } ))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // ⏰ 1 day (in milliseconds)
  }
}));


app.use(passport.initialize())
initialize(passport)
app.use(passport.session())
app.use(checkAuth)
app.use(authorize)

const { uploads, cloudinary } = setupCloudinary()

const mainFunction = async () => {

    await connectToDB(process.env.MONGODB_CONNECTION_STRING)
    app.use('/auth', auth(User))
    app.use('/user', checkAuth, user(User, uploads, cloudinary))

}

app.get('/', (req, res) => {

    res.json({
      
      user: req.user
    });
})

mainFunction()
.then(() => {
    app.listen(PORT, () => {
        console.log("Server is running...")
    })
})
