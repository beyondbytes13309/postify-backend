const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
const GitHubStrategy = require('passport-github')

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
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne( {googleID: profile.id} )
            const email = profile.emails?.[0]?.value
            
            if (!user) {
                // if the user does not exist, we will check if they have the same email 
                // if yes then we will attach the id to that user, if they dont then create a new user 

                user = await User.findOne({ email })
                if (user) {
                    user.googleID = profile.id
                } else {
                    user = new User({
                        googleID: profile.id,
                        username: email.split('@')[0].replace(/[^\w]/g, ''),
                        displayName: profile.displatName,
                        email: email
                    })
                }
                
                await user.save()
            } 

            done(null, user)
        } catch(err) {
            done(err, false)
        }
    }))

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_REDIRECT_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ githubID: profile.id })
            let userID;
            let email =  profile.emails?.[0].value

            if (!user) {
                if (!email) {
                    email = await (await fetch('https://api.github.com/user/emails', {
                        headers: {
                            'Authorization': `token ${accessToken}`, // GitHub checks this token
                            'User-Agent': 'PostifyApp'
                        }
                    })).json();
                }

                user = await User.findOne({ email: email[0].email })

                if (!user) {
                    user = await new User({
                        githubID: profile.id,
                        username: profile.username,
                        email: email[0].email,
                    })
                } else {
                    user.githubID = profile.id
                }

                
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