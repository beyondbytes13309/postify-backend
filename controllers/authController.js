const passport = require('passport')

const registerUser = async (User, req, res) => {
    const { email, password } = req.body;
    console.log("hitting the endpoint")


    const user = await User.findOne({ email })

    if (user) { 
        return res.json({ code: '003' }) 
    }
    
    const newUser = new User({
        email, password
    })

    await newUser.save()

    return res.json({ code: '004', data: null })
}

const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ code: info.code, data: null })

        req.logIn(user, (err) => {
            if (err) return next(err)
            return res.json({ code: '005', data: user})
        })
    })(req, res, next)
}



module.exports = { registerUser, loginUser }