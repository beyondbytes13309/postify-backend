const express = require('express')
const { uploadPfp, editUser, getUserData } = require('../controllers/userController')



module.exports = function(User, Post, uploads, cloudinary) {
    const Router = express.Router()
    
    Router.post("/uploadPfp", (req, res) => uploadPfp(User, uploads, cloudinary, req, res));
    Router.post('/editUser', async (req, res) => editUser(User, req, res))
    Router.get('/getUserData', (req, res) => getUserData(Post, req, res))

    return Router
}
