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
        await comment.populate('authorID', 'displayName profilePicURL role')
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

const getComments = async (Comment, Reaction, req, res) => {
    const postID = req?.params?.postID
    const maxNumOfComments = 10
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * maxNumOfComments;
    const sortMethod = req.query.sort || 'latest'
    
    if (!mongoose.Types.ObjectId.isValid(postID)) {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }

    try {
        let query = Comment.find({ postID }).sort({ createdAt: sortMethod === 'latest' ? -1 : 1 });

        if (maxNumOfComments > 0) {
            query = query.skip(skip).limit(maxNumOfComments);
        }

        const comments = await query
            .select('-__v -updatedAt')
            .populate('authorID', 'displayName profilePicURL role')
            .lean();

        const commentsWithReactions = await Promise.all(
          comments.map(async (comment) => {
            const reactions = await Reaction.find({ resourceID: comment._id }).select('reactionType authorID _id')
            const userReactionObj = reactions.find(r => r.authorID == req.user?._id)
            const userReaction = userReactionObj ? userReactionObj.reactionType : null
            const reactionsToBeSent = reactions.map(r => r.reactionType)
            return {
              ...comment,
              reactions: reactionsToBeSent,
              userReaction,
              userReactionID: userReactionObj?._id,
            };
          })
        );

        return res.status(200).json({ code: '032', data: commentsWithReactions });
    } catch (e) {
        return res.status(500).json({code: '550', data: 'Unexpected error occured!'})
    }

}

const editComment = async (Comment, req, res) => {
    const commentID = req?.params?.commentID;
    const commentText = req?.body?.commentText

    if (!mongoose.Types.ObjectId.isValid(commentID) || !commentText) {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }

    try {
        const result = await Comment.findOneAndUpdate(
            { _id: commentID }, 
            { $set: { commentText }}, 
            { new: true, runValidators: true }
        )
        .select('-__v -updatedAt')
        .populate('authorID', 'displayName profilePicURL role')
        .lean();

        if (!result) {
            return res.status(404).json({ code: '034', data: 'Comment not found!' })
        }
        
        return res.status(200).json({ code: '035', data: { message: 'Comment edited successfully!', comment: result} })

    } catch(err) {
        if (err.name == 'ValidationError') {
            if (err.errors?.commentText?.kind == 'maxlength') {
                return res.status(400).json({ code: '026', data: 'Comment is longer than maximum allowed length'})
            } else if (err.errors?.commentText.kind == 'minlength') {
                return res.status(400).json({ code: '026', data: 'Comment is shorter than minimum allowed length'})
            } 
            return res.status(400).json({ code: '026', data: 'Incorrect data'})
        }

        return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
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

module.exports = { createComment, deleteComment, getComments, editComment }