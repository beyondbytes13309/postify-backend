const express = require('express')

const { createComment, deleteComment, getComments } = require('../controllers/postController')

module.exports = (Comment, Post) => {
    const Router = express.Router()

    return Router
}