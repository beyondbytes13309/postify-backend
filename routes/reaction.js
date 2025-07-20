const express = require('express')
const { makeReaction } = require('../controllers/reactionController')

module.exports = (Reaction, User) => {
    const Router = express.Router()

    Router.post('/makeReaction', (req, res) => makeReaction(Reaction, User, req, res))

    return Router
}