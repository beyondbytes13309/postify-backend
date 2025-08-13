const express = require('express')
const { uploadPfp, editUser, getUserData, restrictUser } = require('../controllers/userController')

const { authorize } = require('../middleware/authVerification.js')

module.exports = function(User, Post, uploads, cloudinary) {
    const Router = express.Router()
    
    Router.post("/uploadPfp", (req, res) => uploadPfp(User, uploads, cloudinary, req, res));
    Router.post('/editUser', async (req, res) => editUser(User, req, res))
    Router.get('/getUserData', (req, res) => getUserData(Post, req, res))
    Router.patch('/restrictUser/:userID', authorize(['restrict_user'], async function(req) {
        return await User.findById(req.params.userID)
    }), (req, res) => restrictUser(User, req, res))

    return Router
}
