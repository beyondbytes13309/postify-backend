const express = require('express')

const { restrictUser, unRestrictUser, giveAuthority } = require('../controllers/adminController')
const { authorize } = require('../middleware/authVerification.js')

module.exports = function(User) {
    const Router = express.Router()
    Router.patch('/restrictUser/:userID', authorize(['restrict_user_level_1', 'restrict_user_level_2', 'restrict_user_level_3'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => restrictUser(User, req, res))
    Router.patch('/unRestrictUser/:userID', authorize(['unrestrict_user_level_1', 'unrestrict_user_level_2', 'unrestrict_user_level_3'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => unRestrictUser(User, req, res))
    Router.get('/giveAuthority/:userID', authorize(['give_authority_moderator']), (req, res) => giveAuthority(User, req, res))

    return Router
}