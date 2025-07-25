const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const defaultPfps = [
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643968/2_km1lrr.png',
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643935/1_ibjelc.png', 
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643969/3_qtfklx.png', 
    'https://res.cloudinary.com/drwa5qpv4/image/upload/v1751643969/4_tymbn4.png', 
]


const genDisplayName = () => `User${Math.floor(Math.random()*10000000)}`
const genUsername = () => {
    const adjectives = ['Cool', 'Fast', 'Smart', 'Silent'];
    const animals = ['Tiger', 'Eagle', 'Panther', 'Wolf', 'Hawk'];
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${adjectives[Math.floor(Math.random()*adjectives.length)]}${animals[Math.floor(Math.random()*animals.length)]}${Math.round(Math.random()*9000)}`
}

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        trim: true, 
        minlength: 6, 
        maxlength: 32, 
        default: genUsername,
        match: [
            /^[A-Za-z0-9!@#$%^&*()_+=\[\]{}|:;<>?.\/~-]+$/,
            'Invalid characters in username'
        ]},
        
    password: { 
        type: String, 
        minlength: 8, 
        maxlength: 128,
        select: false,
        match: [
            /^[A-Za-z0-9!@#$%^&*()_+=\[\]{}|:;<>?.\/~-]+$/,
            'Invalid characters in password'
        ]},
    displayName: { 
        type: String, 
        minlength: 3, 
        maxlength: 32, 
        default: genDisplayName},
    email: { 
        type: String, 
        required: true, unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Invalid format format'
        ]},
    bio: { type: String, default: "", maxlength: 160},
    profilePicURL: { type: String, default: () => defaultPfps[Math.floor(Math.random()*4)] },
    hasDefaultPfp: { type: Boolean, default: true },
    googleID: {type: String},
    githubID: {type: String},
    role: {type: String, enum: ['user', 'jrmod', 'srmod', 'admin', 'owner', 'banned', 'restricted'], default: 'user'},
    numOfPosts: { type: Number, default: 0 },
    numOfMembers: { type: Number, default: 0 }
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema)

module.exports = { User }