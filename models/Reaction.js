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
    resourceID: {
        type: String,
        required: true
    }
})

reactionSchema.index({ authorID: 1, resourceID: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema)

module.exports = { Reaction }