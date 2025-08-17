const express = require('express')
const { editPfp, editSpecificPfp, editUser, editSpecificUser, getUserData, getAnyUserData, restrictUser } = require('../controllers/userController')

const { authorize } = require('../middleware/authVerification.js')

module.exports = function(User, Post, uploads, cloudinary) {
    const Router = express.Router()
    
    Router.patch("/editPfp", authorize(['edit_own_profile']), (req, res) => editPfp(User, uploads, cloudinary, req, res));
    Router.patch('/editSpecificPfp/:userID', authorize(['edit_any_profile'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => editSpecificPfp(User, uploads, cloudinary, req, res))
    Router.patch('/editUser', authorize(['edit_own_profile']), async (req, res) => editUser(req, res))
    Router.patch('/editSpecificUser/:userID', authorize(['edit_any_profile'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => editSpecificUser(User, req, res))
    Router.get('/getUserData', (req, res) => getUserData(Post, req, res))
    Router.get('/getAnyUserData/:userID', (req, res) => getAnyUserData(Post, User, req, res))
    Router.patch('/restrictUser/:userID', authorize(['restrict_user_level_1', 'restrict_user_level_2', 'restrict_user_level_3'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => restrictUser(User, req, res))

    return Router
}
