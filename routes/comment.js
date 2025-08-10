const express = require('express')

const { createComment, deleteComment, getComments, editComment } = require('../controllers/commentController.js')

const { authorize } = require('../middleware/authVerification.js')

module.exports = (Comment, Post) => {
    const Router = express.Router()

    Router.post('/createComment', (req, res) => createComment(Comment, req, res));
    Router.get('/getComments', (req, res) => getComments(Comment, req, res))
    Router.patch('/editComment/:commentID', authorize(['edit_own_comment'], async function(req) {
        return Comment.findById(req.params.commentID)
    }), (req, res) => editComment(Comment, req, res))
    Router.delete('/deleteComment/:commentID', authorize(['delete_own_comment', 'delete_any_comment'], async function(req) {
        return await Comment.findById(req.params.commentID)
    }), (req, res) => deleteComment(Comment, req, res))
    return Router
}