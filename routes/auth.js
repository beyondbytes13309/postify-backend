const express = require('express')

const passport = require('passport')

require('dotenv').config()

const {
    registerUser,
    loginUser  
} 
= require('../controllers/authController')


module.exports = function(User) {
    const Router = express.Router()
    Router.post('/register', (req, res) => registerUser(User, req, res))
    Router.post('/login', (req, res, next) => loginUser(req, res, next))

     // Google Auth start
    Router.get('/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // Google Auth callback
    Router.get('/google/callback', passport.authenticate('google', {
        successRedirect: process.env.GOOGLE_SUCCESS_REDIRECT,
        failureRedirect: process.env.GOOGLE_FAILURE_REDIRECT
    }));
    return Router
}