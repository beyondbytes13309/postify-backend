const passport = require('passport')
const sanitizeUser = require('../utils/security')

const registerUser = async (User, req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ code: '010', data: "Email or password not provided!" }) 
    }
    const user = await User.findOne({ email })

    if (user) { 
        return res.json({ code: '003', data: sanitizeUser(user) }) 
    }
    
    const newUser = new User({
        email, password
    })

    await newUser.save()

    req.logIn(newUser, (err) => {
        if (err) return next(err);
        return res.json({ code: '004', data: sanitizeUser(newUser) });
    });

}

const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ code: info.code, data: null })

        req.logIn(user, (err) => {
            if (err) return next(err)
            return res.json({ code: '005', data: santitize(user)})
        })
    })(req, res, next)
}

const logoutUser = (req, res) => {
    req.logout(() => {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ code: '010', data: 'Failed to logout' })
            res.clearCookie('connect.sid')
            res.status(200).json({ code: '011', data: 'Logged out successfully'})
        })
    })
}


module.exports = { registerUser, loginUser, logoutUser }