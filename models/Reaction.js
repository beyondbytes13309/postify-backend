const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
    authorID: {
        type: String,
        required: true
    },
    reactionType: {
        type: Number,
        min: 0, max: 10,
    },
    postID: {
        type: String,
        required: true
    }
})

const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = { Reaction }