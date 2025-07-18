const createPost = async (Post, User, req, res) => {
    const { postText } = req.body
    if (!postText) {
        return res.status(400).json({ code: '010', data: 'Invalid data'})
    }

    const newPost = new Post({
        authorID: req.user._id,
        postText: postText
    })

    try {
        await newPost.save()
        return res.status(201).json({ code: '015', data: 'Post created successfully'})
    } catch(e) {
        if (e.name == 'ValidationError') {
            if (e.errors?.postText?.kind == 'maxlength') {
                return res
                    .status(400)
                    .json({
                    code: "022",
                    data: "Post is longer than maximum allowed length",
                });
            }
            if (e.errors?.postText?.kind == 'minlength') {
                return res
                    .status(400)
                    .json({
                    code: "022",
                    data: "Post is shorter than minimum allowed length",
                });
            }

            return res.status(400).json({ code: '022', data: 'Incorrect data'})

        } else {
            return res.status(500).json({ code: '550', data: 'Unexpected error occured!'})
        }
    }
}

module.exports = { createPost }