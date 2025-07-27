const express = require('express')
const { createPost, getPosts } = require('../controllers/postController')

module.exports = (Post, Reaction, Comment) => {
    const Router = express.Router()

    Router.post('/createPost', (req, res) => createPost(Post, Reaction, req, res))
    Router.get('/getPosts', (req, res) => getPosts(Post, Reaction, Comment, req, res))

    return Router
}