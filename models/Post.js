const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    authorID: {
        type: String,
        required: true
    },
    postText: {
        type: String,
        minlength: 10,
        maxlength: 300
    }
})

const Post = mongoose.model('Post', postSchema)

module.exports = { Post }