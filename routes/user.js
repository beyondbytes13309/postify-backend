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
    
    Router.post("/uploadPfp", async (req, res) => {
      uploads.single("image")(req, res, async function (err) {
        if (err) {
          return res.json({ code: "030", data: err.message});
        }

        if (!req.file) {
          return res.status(400).json({ code: '031', data: "No image file uploaded" });
        }
        const user = await User.findOne({ _id: req.user._id });
        if (!user.hasDefaultPfp) {
          await cloudinary.uploader.destroy(
            getPublicIdFromUrl(user.profilePicURL)
          );
        } else {
          user.hasDefaultPfp = false;
        }
        user.profilePicURL = req.file.path;

        await user.save();

        return res.json({ code: "032", data: "Saved profile picture" });
      });
    });

    Router.post('/editUser', async (req, res) => {
        const { username, bio } = req.body
        const user = await User.findOne({ _id: req.user._id })

        try {
            if (username && user.username != username) {
                user.username = username
            }
            if (bio && user.bio != bio) {
                user.bio = bio
            }

            await user.save()
        } catch(e) {
            if (e.name == 'ValidationError') {
                if (e.errors?.bio?.kind === 'maxlength') {
                    return res.status(400).json({code: '021', data: 'Bio is longer than maximum allowed length'})
                } else if (e.errors?.username?.kind === 'maxlength') {
                    return res.status(400).json({code: '021', data: 'Username is longer than the maximum allowed length'})
                } else if (e.errors?.username?.kind === 'minlength') {
                    return res.status(400).json({code: '021', data: 'Username is shorter than the minimum allowed length'})
                }
            } else if (e.name == 'MongoServerError') {
                if (e.code == 11000) {
                    return res.status(400).json({code: '021', data: 'Username is taken!'})
                }
            }
            
        }
        

        return res.status(201).json({ code: '020' })
    })

    return Router
}
