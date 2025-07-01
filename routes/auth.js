const express = require('express')


const {
    registerUser,
    loginUser
} 
= require('../controllers/authController')

module.exports = function(User) {
    const Router = express.Router()
    Router.post('/register', (req, res) => registerUser(User, req, res))
    Router.post('/login', (req, res, next) => loginUser(req, res, next))
    return Router
}