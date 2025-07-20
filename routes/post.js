const express = require('express')
const { createPost, getPosts } = require('../controllers/postController')

module.exports = (Post, User) => {
    const Router = express.Router()

    Router.post('/createPost', (req, res) => createPost(Post, User, req, res))
    Router.get('/getPosts', (req, res) => getPosts(Post, User, req, res))

    return Router
}