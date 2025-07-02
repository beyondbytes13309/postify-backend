const passport = require('passport')

const registerUser = async (User, req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (user) return res.json({ code: '003' })
    
    const newUser = new User({
        email, password
    })

    await newUser.save()

    return res.json({ code: '004' })
}

const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ code: info.code })

        req.logIn(user, (err) => {
            if (err) return next(err)
            return res.json({ code: '005', user})
        })
    })(req, res, next)
}



module.exports = { registerUser, loginUser }