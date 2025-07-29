const mongoose = require('mongoose')

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
        await comment.populate('authorID', 'displayName profilePicURL')
        const finalObjToSend = comment.toObject();

        return res.status(201).json({ code: '031', data: {message: 'Comment created successfully', comment: finalObjToSend}})
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

const getComments = async (Comment, req, res) => {
    const postID = req.query.postID
    const page = parseInt(req.query.page) || 1
    const limit = req.query.limit ? parseInt(req.query.limit) : 0
    const skip = (page - 1) * limit;
    
    if (!mongoose.Types.ObjectId.isValid(postID)) {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }

    try {
        let query = Comment.find({ postID }).sort({ createdAt: -1 });

        if (limit > 0) {
            query = query.skip(skip).limit(limit);
        }

        const comments = await query
            .populate('authorID', 'displayName profilePicURL')
            .lean();

        return res.status(200).json({ code: '032', data: comments });
    } catch (e) {
        return res.status(500).json({code: '550', data: 'Unexpected error occured!'})
    }

}

const deleteComment = async (Comment, req, res) => {
    const commentID = req.params.commentID

    if (!mongoose.Types.ObjectId.isValid(commentID)) {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }

    try {
        const result = await Comment.deleteOne({ _id: commentID })

        if (result.deletedCount > 0) {
            return res.status(200).json({ code: '033', data: "Comment deleted successfully!" });
        } else {
            return res.status(404).json({ code: '034', data: "Comment not found" });
        }
        
    } catch(err) {
        return res.status(500).json({code: '550', data: 'Unexpected error occured!'})
    }
}

module.exports = { createComment, deleteComment, getComments }