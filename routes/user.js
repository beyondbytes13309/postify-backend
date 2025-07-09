const express = require('express')
const {} = require('../controllers/userController')

const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const versionIndex = parts.findIndex(p => /^v\d+$/i.test(p));
  const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
  return publicIdWithExt.replace(/\.[^/.]+$/, ''); // remove extension
};

module.exports = function(User, uploads, cloudinary) {
    const Router = express.Router()
    
    Router.post('/uploadPfp', uploads.single('image'), async (req, res) => {
        
        const user = await User.findOne({ _id: req.user._id })
        if (!user.hasDefaultPfp) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(user.profilePicURL))
        } else {
            user.hasDefaultPfp = false
        }
        user.profilePicURL = req.file.path 
        
        await user.save()


        return res.json({ code: '4325' })
    })

    return Router
}
