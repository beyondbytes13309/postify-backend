const express = require('express')
const { makeReaction, deleteReaction } = require('../controllers/reactionController')

module.exports = (Reaction, Post) => {
    const Router = express.Router()

    Router.post('/makeReaction', (req, res) => makeReaction(Reaction, Post, req, res))
    Router.delete('/deleteReaction', (req, res) => deleteReaction(Reaction, Post, req, res))

    return Router
}