const express = require('express')
const { makeReaction, deleteReaction } = require('../controllers/reactionController')

const { authorize } = require('../middleware/authVerification.js')

module.exports = (Reaction, Post, Comment) => {
    const Router = express.Router()

    Router.post('/makeReaction', authorize(['make_reaction']), (req, res) => makeReaction(Reaction, Post, Comment, req, res))
    Router.delete('/deleteReaction/:reactionID', authorize(['delete_own_reaction'], async function(req) {
        return await Reaction.findById(req.params.reactionID).populate('authorID', 'role')
    }), (req, res) => deleteReaction(Reaction, Post, req, res))

    return Router
}