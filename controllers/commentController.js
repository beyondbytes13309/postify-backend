const createComment = async (Comment, req, res) => {
    const commentText = req.body.commentText
    const postID = req.body.postID
    const authorID = req.user._id

    if (!postID || !commentText) {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }

    const comment = new Comment({
        authorID,
        commentText,
        postID
    })

    try {
        await comment.save()
        return res.status(201).json({ code: '031', data: 'Comment created successfully'})
    } catch(e) {
        if (e.name == 'ValidationError') {
            if (e.errors?.commentText?.kind == 'maxlength') {
                return res.status(400).json({ code: '025', data: 'Comment is longer than maximum allowed length'})
            } else if (e.errors?.commentText.kind == 'minlength') {
                return res.status(400).json({ code: '025', data: 'Comment is shorter than minimum allowed length'})
            } 
            return res.status(400).json({ code: '025', data: 'Incorrect data'})
        }

        return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
    }
}

const deleteComment = (Comment, req, res) => {

}

const getComments = (Comment, req, res) => {

}

module.exports = { createComment, deleteComment, getComments }