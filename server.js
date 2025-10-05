const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require("path");
require('dotenv').config()
const session = require('express-session')
const passport = require('passport')



const { User } = require('./models/User');
const { Post } = require('./models/Post')
const { Reaction } = require('./models/Reaction')
const { Comment } = require('./models/Comment.js')
const { connectToDB } = require('./utils/connectServices.js');
const auth = require('./routes/auth.js');
const user = require('./routes/user.js')
const post = require('./routes/post.js')
const reaction = require('./routes/reaction.js')
const comment = require('./routes/comment.js')
const admin = require('./routes/admin.js')


const { checkAuth, authorize, checkRestriction } = require('./middleware/authVerification.js')

const initialize = require('./utils/passportConfig.js')
const { setupCloudinary } = require('./utils/cloudinaryConfig.js')
const { init } = require('./utils/tagging.js')



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
app.use(checkRestriction())


const { uploads, cloudinary } = setupCloudinary()

const mainFunction = async () => {

    await connectToDB(process.env.MONGODB_CONNECTION_STRING)
    await init()
    app.use('/auth', auth(User))
    app.use('/user', checkAuth, user(User, Post, uploads, cloudinary))
    app.use('/post', checkAuth, post(Post, Reaction, Comment))
    app.use('/reaction', checkAuth, reaction(Reaction, Post, Comment))
    app.use('/comment', checkAuth, comment(Comment, Reaction))
    app.use('/admin', checkAuth, admin(User))

}

app.get('/', (req, res) => {
    return res.json({
      code: '13309',
      data: 'Hmm, what are you up to 👋'
    })
})

mainFunction()
.then(() => {
    app.listen(PORT, () => {
        console.log("Server is running...")
    })
})
