const express = require('express')
const {} = require('../controllers/userController')

module.exports = function(User, uploads) {
    const Router = express.Router()
    
    Router.post('/uploadPfp', /*uploads.single('image'),*/ async (req, res) => {
        
        //const user = await User.findOne({ _id: req.user._id })
        //user.profilePicURL = req.file.path 
        //await user.save()

        return res.send(req?.user?._id)
    })

    return Router
}
