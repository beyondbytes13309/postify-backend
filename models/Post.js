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
    },
    isEdited: { type: Boolean, default: false },
    tags: { type: Object, select: false }
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema)

module.exports = { Post }