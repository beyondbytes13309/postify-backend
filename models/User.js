const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, trim: true, minlength: 6, maxlength: 32, default: `User ${Math.floor(Math.random()*10000000)}`},
    password: { type: String, minlength: 8, maxlength: 128},
    email: { type: String, required: true, unique: true},
    bio: { type: String, default: "", maxlength: 160},
    profilePicURL: { type: String, default: "" },
    googleID: {type: String},
    githubID: {type: String}
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema)

module.exports = { User }