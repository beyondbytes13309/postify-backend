const express = require('express')
const { uploadPfp, editUser } = require('../controllers/userController')



module.exports = function(User, uploads, cloudinary) {
    const Router = express.Router()
    
    Router.post("/uploadPfp", (req, res) => uploadPfp(User, uploads, cloudinary, req, res));
    Router.post('/editUser', async (req, res) => editUser(User, req, res))

    return Router
}
