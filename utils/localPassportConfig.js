const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
const { User } = require('../models/User')
const bcrypt = require('bcrypt')


require('dotenv').config()

function initialize(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username })
            if (!user) return done(null, false, {code: '001'})

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return done(null, false, {code: '002'})

            return done(null, user)
        } catch(err) {
            return done(err, false)
        }
    }))

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL
    }, async (accessToken, regreshToken, profile, done) => {
        try {
            let user = await User.findOne( {googleID: profile.id} )
            if (!user) {
                user = await new User({
                    googleID: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value
                })
                await user.save()
            }

            done(null, user)
        } catch(err) {
            done(err, false)
        }
    }))

    // handling sessions
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user)
        } catch(err) {
            done(err, false)
        }
    })
}

module.exports = initialize