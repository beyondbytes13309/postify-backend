const { User } = require('../models/User.js');
const { sanitizeUser } = require('../utils/security.js')
const mongoose = require('mongoose')

const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const versionIndex = parts.findIndex(p => /^v\d+$/i.test(p));
  const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
  return publicIdWithExt.replace(/\.[^/.]+$/, ''); // remove extension
};

const editPfpHelper = (uploads, cloudinary, req, res, user) => {
  return new Promise((resolve, reject) => {
    uploads.single("image")(req, res, async function (err) {
    if (err) {
      //return res.status(400).json({ code: "030", data: err.message });
      return reject({ code: "030", data: err.message });
    }

    if (!req.file) {
      /*return res
        .status(400)
        .json({ code: "031", data: "No image file uploaded" }); */
      return reject({ code: "031", data: "No image file uploaded" })
    }

    try {
      if (!user.hasDefaultPfp) {
        await cloudinary.uploader.destroy(getPublicIdFromUrl(user.profilePicURL));
      } else {
        user.hasDefaultPfp = false;
      }
      user.profilePicURL = req.file.path;

      await user.save();

      resolve({ code: "032", data: "Saved profile picture" })
    } catch(e) {
      reject({ code: '550', data: "Unexpected error occured!" })
    }

  });
  })
}

const editPfp = async (User, uploads, cloudinary, req, res) => {
  const user = req?.user

  if (!user) {
    return res.status(404).json({ code: '001', data: 'User not found'})
  }

  try {
    const result = await editPfpHelper(uploads, cloudinary, req, res, user)
    return res.status(200).json(result);
  } catch(e) {
    if (e.code == '550') return res.status(500).json(e)
    return res.status(400).json(e) 
  }

};

const editSpecificPfp = async (User, uploads, cloudinary, req, res) => {
  const userID = req?.params?.userID

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ code: '010', data: 'Invalid userID!' })
  }

  const user = await User.findById(userID)

  if (!user) {
    return res.status(404).json({ code: '001', data: 'User not found'})
  }

  try {
    const result = await editPfpHelper(uploads, cloudinary, req, res, user)
    return res.status(200).json(result);
  } catch(e) {
    if (e.code == '550') return res.status(500).json(e)
    return res.status(400).json(e) 
  }
};

const editUserHelper = async (req, res, user) => {
  const { username, bio, displayName } = req?.body;

  try {
    if (!user) {
      return res.status(404).json({ code: '001', data: 'User not found'})
    }

    if (username && user.username != username) {
      user.username = username.trim();
    }
    if (bio !== null && bio !== undefined && user.bio !== bio) {
      user.bio = bio.trim();
    }


    if (displayName && user.displayName != displayName) {
      user.displayName = displayName.trim();
    }

    await user.save();
  } catch (e) {
    if (e.name == "ValidationError") {
      if (e.errors?.bio?.kind === "maxlength") {
        return res
          .status(400)
          .json({
            code: "021",
            data: "Bio is longer than maximum allowed length",
          });
      } else if (e.errors?.username?.kind === "maxlength") {
        return res
          .status(400)
          .json({
            code: "021",
            data: "Username is longer than the maximum allowed length",
          });
      } else if (e.errors?.username?.kind === "minlength") {
        return res
          .status(400)
          .json({
            code: "021",
            data: "Username is shorter than the minimum allowed length",
          });
      } else if (e.errors?.displayName?.kind === "minlength") {
        return res
          .status(400)
          .json({
            code: "021",
            data: "Display name is shorter than the minimum allowed length",
          });
      } else if (e.errors?.displayName?.kind === "maxlength") {
        return res
          .status(400)
          .json({
            code: "021",
            data: "Display name is longer than the minimum allowed length",
          });
      } 
      
      return res.status(400).json({ code: '021', data: 'Incorrect data'})

    } else if (e.name == "MongoServerError") {
      if (e.code == 11000) {
        return res
          .status(400)
          .json({ code: "021", data: "Username is taken!" });
      }
    }

    return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
  }

  return res.status(200).json({ code: "020" });
}

const editUser = async (req, res) => {
  const user = req?.user

  editUserHelper(req, res, user)
  
};

const editSpecificUser = async (User, req, res) => {
  const userID = req?.params?.userID

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ code: '010', data: 'Invalid userID!' })
  }

  const user = await User.findById(userID)

  editUserHelper(req, res, user)
  
}

const getUserData = async (Post, req, res) => {
  const user = req?.user
  const numOfPosts = await Post.countDocuments({ authorID: user?._id })
  return res.json({
    code: '055',
    user: {...sanitizeUser(user), numOfPosts}
  });
}

const getAnyUserData = async (Post, User, req, res) => {
  const userID = req?.params?.userID
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ code: '010', data: 'Invalid userID!' })
  }

  try {
    const user = await User.findById(userID)

    if (!user) {
      return res.status(404).json({ code: '001', data: 'User not found'})
    }
    const numOfPosts = await Post.countDocuments({ authorID: user._id })
    return res.json({
      code: '056',
      user: {...sanitizeUser(user), numOfPosts}
    });
  } catch(e) {
    return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
  }
   
}

module.exports = { editPfp, editSpecificPfp, editUser, editSpecificUser, getUserData, getAnyUserData };
