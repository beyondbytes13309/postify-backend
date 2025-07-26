const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    authorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    commentText: {
        type: String,
        minlength: 5, 
        maxlength: 150,
        required: true
    },
    postID: {
        type: String,
        required: true
    }
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = { Comment }