const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const defaultPfps = [
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643968/2_km1lrr.png',
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643935/1_ibjelc.png', 
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643969/3_qtfklx.png', 
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643969/4_tymbn4.png', 
]

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, trim: true, minlength: 6, maxlength: 32, default: `User ${Math.floor(Math.random()*10000000)}`},
    password: { type: String, minlength: 8, maxlength: 128},
    email: { type: String, required: true, unique: true},
    bio: { type: String, default: "", maxlength: 160},
    profilePicURL: { type: String, default: defaultPfps[Math.floor(Math.random()*4)] },
    googleID: {type: String},
    githubID: {type: String},
    role: {type: String, enum: ['user', 'jrmod', 'srmod', 'admin', 'owner', 'banned', 'restricted'], default: 'user'}
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema)

module.exports = { User }