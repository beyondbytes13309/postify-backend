const passport = require('passport')

const registerUser = async (User, req, res) => {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email })

    if (user) return res.json({ message: "User already exists!" })
    
    const newUser = new User({
        username, email, password
    })

    await newUser.save()

    return res.json({ message: "User registered!"})
}

const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ message: info.message })

        req.logIn(user, (err) => {
            if (err) return next(err)
            return res.json({ message: 'Login successful!', user})
        })
    })(req, res, next)
}


module.exports = { registerUser, loginUser }