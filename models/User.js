const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 6, maxlength: 32},
    password: { type: String, required: true, minlength: 8, maxlength: 32},
    email: { type: String, required: true, unique: true},
    bio: { type: String, default: "", maxlength: 160},
    profilePicURL: { type: String, default: "" }
}, {
    timestamps: true
})

userSchema.pre('save', async function(next) {
    if (this.isModified(this.password)) return next()
    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

const User = mongoose.model('User', userSchema)

module.exports = { User }