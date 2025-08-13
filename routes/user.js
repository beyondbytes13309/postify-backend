const express = require('express')
const { uploadPfp, editUser, getUserData, restrictUser } = require('../controllers/userController')

const { authorize } = require('../middleware/authVerification.js')

module.exports = function(User, Post, uploads, cloudinary) {
    const Router = express.Router()
    
    Router.post("/uploadPfp", authorize(['edit_own_profile', 'edit_any_profile']), (req, res) => uploadPfp(User, uploads, cloudinary, req, res));
    Router.post('/editUser', authorize(['edit_own_profile', 'edit_any_profile']), async (req, res) => editUser(User, req, res))
    Router.get('/getUserData', (req, res) => getUserData(Post, req, res))
    Router.get('/restrictUser/:userID', authorize(['restrict_user_level_1', 'restrict_user_level_2', 'restrict_user_level_3'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => restrictUser(User, req, res))

    return Router
}
