const express = require('express')
const { createPost } = require('../controllers/postControlller')

module.exports = (Post, User) => {
    const Router = express.Router()

    Router.post('/createPost', (req, res) => createPost(Post, User, req, res))

    return Router
}