const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    authorID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    postText: {
        type: String,
        minlength: 10,
        maxlength: 300
    }
})

const Post = mongoose.model('Post', postSchema)

module.exports = { Post }