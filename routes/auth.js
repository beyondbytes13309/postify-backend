const express = require('express')

const passport = require('passport')

require('dotenv').config()

const {
    registerUser,
    loginUser,
    logoutUser
} 
= require('../controllers/authController')


module.exports = function(User) {
    const Router = express.Router()
    Router.post('/register', (req, res) => registerUser(User, req, res))
    Router.post('/login', (req, res, next) => loginUser(req, res, next))
    Router.post('/logout', (req, res) => logoutUser(req, res))

     // Google Auth start
    Router.get('/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // Google Auth callback
    Router.get('/google/callback', passport.authenticate('google', {
        successRedirect: process.env.SUCCESS_REDIRECT,
        failureRedirect: process.env.FAILURE_REDIRECT
    }));

    Router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));
    Router.get('/github/callback', passport.authenticate('github', {
        successRedirect: process.env.SUCCESS_REDIRECT,
        failureRedirect: process.env.FAILURE_REDIRECT
    }))
    return Router
}