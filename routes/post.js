const express = require('express')
const { createPost, getPosts, deletePost } = require('../controllers/postController')
const { authorize } = require('../middleware/authVerification.js')

module.exports = (Post, Reaction, Comment) => {
    const Router = express.Router()

    Router.post('/createPost', (req, res) => createPost(Post, Reaction, req, res))
    Router.get('/getPosts', (req, res) => getPosts(Post, Reaction, Comment, req, res))
    Router.get('/deletePost/:postID', authorize(['delete_own_post', 'delete_any_post'], async function(req) {
        return await Post.findById(req.params.postID)
    }), (req, res) => deletePost(Post, Reaction, Comment, req, res))

    return Router
}