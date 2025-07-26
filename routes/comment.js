const express = require('express')

const { createComment, deleteComment, getComments } = require('../controllers/commentController.js')

module.exports = (Comment, Post) => {
    const Router = express.Router()

    Router.post('/createComment', (req, res) => createComment(Comment, req, res))
    return Router
}