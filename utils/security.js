
const sanitizeUser = (user) => {
    return {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        profilePicURL: user.profilePicURL,
        role: user.role,
        createdAt: user.createdAt,
        restrictionObject: user.restrictionObject
    }
}

module.exports = { sanitizeUser }