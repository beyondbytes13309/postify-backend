const createPost = (Post, User, req, res) => {
    return res.status(200).json({ code: '69', data: 'Only for testing purposes' })
}

module.exports = { createPost }