const express = require('express')
const { createPost, getPosts, getUserPosts, deletePost, editPost } = require('../controllers/postController')
const { authorize } = require('../middleware/authVerification.js')

module.exports = (Post, Reaction, Comment) => {
    const Router = express.Router()

    Router.post('/createPost', authorize(['create_post']), (req, res) => createPost(Post, Reaction, req, res))
    Router.get('/getPosts', authorize(['view_posts']), (req, res) => getPosts(Post, Reaction, Comment, req, res))
    Router.get('/getUserPosts/:userID', authorize(['view_posts']), (req, res) => getUserPosts(Post, Reaction, Comment, req, res))
    Router.delete('/deletePost/:postID', authorize(['delete_own_post', 'delete_any_post'], async function(req) {
        return await Post.findById(req.params.postID).populate('authorID', 'role')
    }), (req, res) => deletePost(Post, Reaction, Comment, req, res))
    Router.patch('/editPost/:postID', authorize(['edit_own_post', 'edit_any_post'], async function(req) {
        return await Post.findById(req.params.postID).populate('authorID', 'role')
    }), (req, res) => editPost(Post, req, res))

    return Router
}