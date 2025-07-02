const LocalStrategy = require('passport-local')
const { User } = require('../models/User')
const bcrypt = require('bcrypt')

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