const mongoose = require('mongoose')

const createPost = async (Post, Reaction, req, res) => {
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

const getPosts = async (Post, Reaction, Comment, req, res) => {
    const maxNumOfPosts = 10
    const page = parseInt(req?.query?.page) || 1
    const skip = (page - 1) * maxNumOfPosts;

    try {
        let query = Post.find()

        if (maxNumOfPosts > 0) {
            query = query.skip(skip).limit(maxNumOfPosts);
        }

        const posts = await query
            .sort({ createdAt: -1 })
            .populate('authorID', '_id displayName profilePicURL')
        

        const postsWithReactions = await Promise.all(
          posts.map(async (post) => {
            const reactions = await Reaction.find({ postID: post._id }).select('reactionType authorID _id')
            const numOfComments = await Comment.countDocuments({ postID: post._id })
            const userReactionObj = reactions.find(r => r.authorID == req.user?._id)
            const userReaction = userReactionObj ? userReactionObj.reactionType : null
            return {
              ...post.toObject(),
              reactions,
              userReaction,
              userReactionID: userReactionObj?._id,
              numOfComments
            };
          })
        );
        return res.status(200).json({ code: '014', data: postsWithReactions})
    } catch(e) {
        return res.status(500).json({code: '550', data: 'Unexpected error occured!'})
    }
    
}

const getUserPosts = async (Post, Reaction, Comment, req, res) => {
    const userID = req?.params?.userID
    const maxNumOfPosts = 10
    const page = parseInt(req?.query?.page) || 1
    const skip = (page - 1) * maxNumOfPosts;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ code: '010', data: 'Invalid userID!' })
    }

    try {
        let query = Post.find({ authorID: userID })

        if (maxNumOfPosts > 0) {
            query = query.skip(skip).limit(maxNumOfPosts);
        }

        const posts = await query
            .sort({ createdAt: -1 })
            .populate('authorID', '_id displayName profilePicURL')

        const postsWithReactions = await Promise.all(
            posts.map(async (post) => {
            const reactions = await Reaction.find({ postID: post._id }).select('reactionType authorID _id')
            const numOfComments = await Comment.countDocuments({ postID: post._id })
            const userReactionObj = reactions.find(r => r.authorID == req.user?._id)
            const userReaction = userReactionObj ? userReactionObj.reactionType : null
            return {
                ...post.toObject(),
                reactions,
                userReaction,
                userReactionID: userReactionObj?._id,
                numOfComments
            };
            })
        );
        return res.status(200).json({ code: '013', data: postsWithReactions})
    } catch(e) {
        return res.status(500).json({code: '550', data: 'Unexpected error occured!'})
    }
}

const deletePost = async (Post, Reaction, Comment, req, res) => {

    try {

    
    const postID = req.params.postID

    if (!mongoose.Types.ObjectId.isValid(postID)) {
        return res.status(400).json({ code: '010', data: 'Invalid data!' })
    }

    const result = await Post.deleteOne({ _id: postID })

    if (result?.deletedCount > 0) {

        await Promise.all([
            Comment.deleteMany({ postID }),
            Reaction.deleteMany({ postID })
        ])

        return res.status(200).json({ code: '012', data: 'Deleted post successfully!' })
    } else {
        return res.status(200).json({ code: '016', data: 'Post not found' })
    }

    } catch(e) {
        return res.status(500).json({code: '550', data: 'Unexpected error occured!'})
    }
    
}

module.exports = { createPost, getPosts, getUserPosts, deletePost }