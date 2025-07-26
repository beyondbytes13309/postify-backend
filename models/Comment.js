const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    authorID: {
        type: String,
        required: true
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