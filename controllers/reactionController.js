const mongoose = require('mongoose')

const makeReaction = async (Reaction, Post, req, res) => {
    const postID = req.body.postID
    const reactionType = req.body.reactionType

    const authorID = req?.user?._id


    if (!postID || !typeof reactionType === 'number') {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }

    const post = await Post.findOne({ _id: postID })

    if (!post) {
        return res.status(404).json({ code: '016', data: 'Post not found!' })
    }


    let reaction =  await Reaction.findOne({ authorID, postID})
    let message;

    if (reaction) {
        reaction.reactionType = reactionType
        message = "Modified reaction successfully"
    } else {
        reaction = new Reaction({
            authorID: authorID,
            reactionType: reactionType,
            postID: postID
        })
        message = "Created reaction successfully"
    }

    try {
        await reaction.save()
        return res.status(201).json({ code: '017', data: message || 'Something is fishy...'})
    } catch(e) {
        if (e.name == 'ValidationError') {
            if (e.errors?.reactionType?.kind == 'max') {
                return res.status(400).json({ code: '023', data: 'reactionType is greater than limit of 10'})
            } else if (e.errors?.reactionType?.kind == 'min') {
                return res.status(400).json({ code: '023', data: 'reactionType is smaller than limit of 0'})
            } else if (e.errors?.authorID?.kind == 'required') {
                return res.status(400).json({ code: '023', data: 'authorID is required!'})
            } else if (e.errors?.postID?.kind == 'required') {
                return res.status(400).json({ code: '023', data: 'postID is required'})
            }
            
            return res.status(400).json({ code: '023', data: 'Incorrect data'})
        }

        return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
    }

}

const deleteReaction = async (Reaction, Post, req, res) => {
    const reactionID = req.params.reactionID

    if (!mongoose.Types.ObjectId.isValid(reactionID)) {
        return res.status(400).json({ code: '010', data: 'Data required!' })
    }
    
    let reaction

    try {
        reaction = await Reaction.findOne({ _id: reactionID })
    } catch(e) {
        return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
    }
    

    if (!reaction) {
        return res.status(404).json({ code: '018', data: 'Reaction not found!' })
    }

    await Reaction.deleteOne({ _id: reactionID })
    return res.status(200).json({ code: '018', data: 'Reaction deleted successfully'})

}


module.exports = { makeReaction, deleteReaction }